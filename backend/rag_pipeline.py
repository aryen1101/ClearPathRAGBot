import os
import chromadb
from groq import Groq
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from typing import List, Any, cast

load_dotenv()

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("docs")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def contextualize_question(query: str, chat_history: List[dict]):
    """
    If the user uses pronouns (it, they, that), this reformulates the query
    based on the chat history into a standalone question for retrieval.
    """
    if not chat_history or len(query.split()) < 3:
        return query

    history_str = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history[-3:]])  # Take last 3 turns

    prompt = f"""
    Given the following chat history and a follow-up question, rephrase the follow-up 
    question to be a standalone question that includes all necessary context.

    Chat History:
    {history_str}

    Follow-up Question: {query}
    Standalone Question:"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    return response.choices[0].message.content


def retrieve_context(query, chat_history=None, n_results=3):
    standalone_query = contextualize_question(query, chat_history or [])

    query_vector = embedding_model.encode([standalone_query]).tolist()

    results = collection.query(
        query_embeddings=query_vector,
        n_results=n_results
    )

    context_chunks = results['documents'][0]
    distances = results['distances'][0]
    metadatas = results['metadatas'][0]

    return "\n\n".join(context_chunks), distances, metadatas


def generate_answer(query, context, model_name, chat_history=None):
    """
    Generates response using context and the full conversation history.
    """
    system_prompt = f"""
    You are a customer support agent for Clearpath. 
    Answer using ONLY the provided context. If the answer isn't there, say you don't know.

    Context:
    {context}
    """

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history[-5:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": query})

    response = groq_client.chat.completions.create(
        model=model_name,
        messages=cast(Any, messages),
        temperature=0,
    )

    return {
        "content": response.choices[0].message.content,
        "tokens_input": response.usage.prompt_tokens,
        "tokens_output": response.usage.completion_tokens,
        "model": model_name
    }