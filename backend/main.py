import time
import uuid
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import your custom modules
from router import classify_query
from rag_pipeline import retrieve_context, generate_answer
from evaluator import evaluate_response

# Load environment variables
load_dotenv()

app = FastAPI(title="ClearPath Chatbot API")

# --- CORS Setup ---
# Required so your React frontend can talk to this FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Contract Models ---
class QueryRequest(BaseModel):
    question: str
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


# --- The Required Endpoint ---
@app.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    start_time = time.perf_counter()

    # Generate a conversation ID if not provided
    conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"

    try:
        # Layer 2: Deterministic Routing
        classification, model_name = classify_query(request.question)

        # Layer 1: RAG Retrieval
        # We expect retrieve_context to return (context_text, distances, metadatas)
        context, distances, metadatas = retrieve_context(request.question , n_results=5)

        # Generation Step
        llm_result = generate_answer(request.question, context, model_name)

        # Layer 3: Output Evaluation
        is_flagged, flag_label = evaluate_response(llm_result['content'], distances)
        flags = [flag_label] if is_flagged else []

        # Mandatory Contract Check: "no_context" flag
        if len(distances) == 0 or distances[0] > 0.8:
            if "no_context" not in flags:
                flags.append("no_context")

        # Performance Tracking
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        # Format Sources
        sources_list = []
        for i in range(len(distances)):
            # Convert distance to a 0-1 relevance score
            score = 1 - distances[i]
            sources_list.append(Source(
                document=metadatas[i].get('source', 'Unknown'),
                relevance_score=round(score, 2)
            ))

        # Final Response matching the Contract Specification
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
        # Standard error handling to prevent API crashes
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    # Defaults to localhost:8000 as per deployment requirements
    uvicorn.run(app, host="0.0.0.0", port=8000)