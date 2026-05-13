from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Product
from ..services.rag_service import rag_service, RAGService

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    sources: List[dict] = []


async def get_rag_service():
    """Get and initialize the RAG service."""
    await rag_service.initialize()
    return rag_service


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    rag: RAGService = Depends(get_rag_service),
    db: Session = Depends(get_db)
):
    """RAG-powered chatbot endpoint."""

    # Get current products from database
    products = db.query(Product).all()
    product_data = [
        {
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': p.price,
            'category': p.category,
            'stock': p.stock
        }
        for p in products
    ]

    # Index products (only if collection is empty or on first run)
    try:
        await rag.index_products(product_data)
        await rag.index_policies()
    except Exception as e:
        print(f"Indexing error (may be first run): {e}")

    # Search for relevant context
    context = await rag.search(request.message, top_k=5)

    # Generate response with context
    response = await rag.generate_response(request.message, context)

    # Format sources
    sources = []
    for c in context:
        meta = c.get('metadata', {})
        if meta.get('type') == 'product':
            sources.append({
                'type': 'product',
                'title': meta.get('title', ''),
                'category': meta.get('category', '')
            })
        elif meta.get('type') == 'faq':
            sources.append({
                'type': 'faq',
                'question': meta.get('question', '')
            })

    return ChatResponse(response=response, sources=sources)


@router.post("/reindex")
async def reindex_products(db: Session = Depends(get_db)):
    """Re-index all products and policies (admin endpoint)."""
    products = db.query(Product).all()
    product_data = [
        {
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'price': p.price,
            'category': p.category,
            'stock': p.stock
        }
        for p in products
    ]

    await rag_service.initialize()
    await rag_service.index_products(product_data)
    await rag_service.index_policies()

    return {"message": f"Re-indexed {len(products)} products and policies"}


@router.get("/status")
async def chat_status():
    """Check RAG service status."""
    import os

    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3")

    return {
        "status": "ready",
        "embedding": "TF-IDF (sklearn)",
        "llm": ollama_model,
        "llm_url": ollama_url,
        "vector_store": "ChromaDB"
    }