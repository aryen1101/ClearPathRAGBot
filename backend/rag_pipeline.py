import os
import chromadb
from groq import Groq
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from typing import List, Any, cast

# Load environment variables
load_dotenv()

# Initialize ChromaDB, Embedding Model, and Groq Client
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("docs")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def retrieve_context(query, n_results=3):
    """
    Finds the most relevant chunks from ChromaDB.
    """
    # Convert query to embedding
    query_vector = embedding_model.encode([query]).tolist()

    # Query the collection
    results = collection.query(
        query_embeddings=query_vector,
        n_results=n_results
    )

    # 1. Extract the documents (text)
    context_chunks = results['documents'][0]

    # 2. Extract the 'distance' (similarity score)
    distances = results['distances'][0]

    # 3. Extract the 'metadatas' (contains the source filename)
    metadatas = results['metadatas'][0]

    # Return ALL THREE values to match what main.py expects
    return "\n\n".join(context_chunks), distances, metadatas


def generate_answer(query, context, model_name):
    """
    Sends the prompt to Groq and returns the response with token usage/latency.
    """
    system_prompt = f"""
    You are a customer support agent for Clearpath, a project management tool.
    Answer the user's question using ONLY the provided context.
    If the answer is not in the context, say you don't know.

    Context:
    {context}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]

    response = groq_client.chat.completions.create(
        model=model_name,
        messages=cast(Any, messages),  # This silences the warning
        temperature=0,
    )

    return {
        "content": response.choices[0].message.content,
        "tokens_input": response.usage.prompt_tokens,
        "tokens_output": response.usage.completion_tokens,
        "model": model_name
    }