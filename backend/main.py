import time
import uuid
import os
import uvicorn

from typing import List, Optional, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Importing your logic modules
from router import classify_query
from rag_pipeline import retrieve_context, generate_answer
from evaluator import evaluate_response

load_dotenv()

app = FastAPI(title="ClearPath Chatbot API - Production v1.0")

# --- SECURE CORS CONFIGURATION ---
# Replace with your actual frontend URLs
origins = [
    "http://localhost:5173",             # Local Vite
    "http://localhost:3000",             # Local React
    "https://clear-path-rag-bot.vercel.app", # Your deployed Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---

class QueryRequest(BaseModel):
    question: str
    chat_history: List[dict] = []
    conversation_id: Optional[str] = None

class TokenUsage(BaseModel):
    input: int
    output: int

class MetaData(BaseModel):
    model_used: str
    classification: str
    tokens: TokenUsage
    latency_ms: int
    chunks_retrieved: int
    evaluator_flags: List[str]

class Source(BaseModel):
    document: str
    page: Optional[int] = None
    relevance_score: float

class QueryResponse(BaseModel):
    answer: str
    metadata: MetaData
    sources: List[Source]
    conversation_id: str

# --- ENDPOINTS ---

@app.get("/")
def root():
    return {"status": "online", "message": "ClearPath Backend is running"}

@app.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """
    Core RAG Pipeline Endpoint with Latency Optimization
    """
    start_time = time.perf_counter()
    conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"

    # 1. LATENCY FIX: Short-Circuit for Greetings
    quick_queries = {
        "hi": "Hello! I'm the ClearPath assistant. How can I help you today?",
        "hello": "Hi there! How can I assist you with ClearPath?",
        "hey": "Hey! Need help with something specific?",
        "thanks": "You're very welcome! Let me know if you need anything else.",
        "thank you": "Happy to help! Feel free to ask more questions."
    }

    clean_query = request.question.lower().strip()
    if clean_query in quick_queries:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        return QueryResponse(
            answer=quick_queries[clean_query],
            metadata=MetaData(
                model_used="static_handler",
                classification="greeting",
                tokens=TokenUsage(input=0, output=0),
                latency_ms=latency_ms,
                chunks_retrieved=0,
                evaluator_flags=[]
            ),
            sources=[],
            conversation_id=conv_id
        )

    # 2. FULL RAG PIPELINE
    try:
        # Layer 1: Routing
        classification, model_name = classify_query(request.question)

        # Layer 2: Retrieval (Includes question contextualization)
        context, distances, metadatas = retrieve_context(
            request.question,
            chat_history=request.chat_history,
            n_results=5
        )

        # Layer 3: Generation
        llm_result = generate_answer(
            request.question,
            context,
            model_name,
            chat_history=request.chat_history
        )

        # Layer 4: Evaluation
        is_flagged, flag_label = evaluate_response(llm_result['content'], distances)
        flags = [flag_label] if is_flagged else []

        # Logic for "No Context Found"
        if len(distances) == 0 or all(d > 0.8 for d in distances):
            if "no_context" not in flags:
                flags.append("no_context")

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        # Prepare Sources
        sources_list = []
        for i in range(len(distances)):
            score = max(0, 1 - distances[i])
            sources_list.append(Source(
                document=metadatas[i].get('source', 'Unknown'),
                relevance_score=round(float(score), 2)
            ))

        return QueryResponse(
            answer=llm_result['content'],
            metadata=MetaData(
                model_used=model_name,
                classification=classification,
                tokens=TokenUsage(
                    input=llm_result['tokens_input'],
                    output=llm_result['tokens_output']
                ),
                latency_ms=latency_ms,
                chunks_retrieved=len(distances),
                evaluator_flags=flags
            ),
            sources=sources_list,
            conversation_id=conv_id
        )

    except Exception as e:
        print(f"CRITICAL PIPELINE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal RAG Pipeline Error")

if __name__ == "__main__":
    # Use PORT environment variable for Railway deployment

    uvicorn.run(app, host="0.0.0.0", port=8080)