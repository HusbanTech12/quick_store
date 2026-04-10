from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from . import models
from .routers import auth, users, products, orders

# Create tables on startup (for development; use alembic in production)
if os.getenv("CREATE_TABLES_ON_STARTUP", "true").lower() == "true":
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickStore E-commerce API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "QuickStore API"}


@app.get("/")
def root():
    return {
        "message": "Welcome to QuickStore E-commerce API",
        "docs": "/docs",
        "version": "1.0.0"
    }
