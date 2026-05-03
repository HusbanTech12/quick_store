from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from . import models
from .routers import auth, users, products, orders, stripe

# Create tables on startup (for development; use alembic in production)
if os.getenv("CREATE_TABLES_ON_STARTUP", "true").lower() == "true":
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickStore E-commerce API", version="1.0.0")

# CORS - Allow all origins for now, restrict in production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "https://quick-store-sooty.vercel.app",
]

# Add custom origin from environment variable if provided
custom_origin = os.getenv("FRONTEND_URL")
if custom_origin:
    allowed_origins.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(stripe.router)


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
