from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from . import models
from .routers import auth, users, products, orders, stripe, chat, inventory, upload

# Create tables on startup (for development; use alembic in production)
if os.getenv("CREATE_TABLES_ON_STARTUP", "true").lower() == "true":
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickStore E-commerce API", version="1.0.0")

# CORS configuration
allowed_origins = []

# Parse FRONTEND_URLS (comma-separated list of allowed origins)
frontend_urls = os.getenv("FRONTEND_URLS", "")
if frontend_urls:
    allowed_origins.extend([u.strip() for u in frontend_urls.split(",") if u.strip()])

# Fall back to FRONTEND_URL for backward compatibility
custom_origin = os.getenv("FRONTEND_URL")
if custom_origin and custom_origin not in allowed_origins:
    allowed_origins.append(custom_origin)

# Always allow localhost for development
if os.getenv("CORS_ALLOW_ALL", "").lower() == "true":
    allowed_origins.append("*")
else:
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
    ])

    # Add from env var with semicolon fallback
    origins_var = os.getenv("CORS_ORIGINS", "")
    if origins_var:
        allowed_origins.extend([o.strip() for o in origins_var.replace(";", ",").split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True if "*" not in allowed_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(stripe.router)
app.include_router(chat.router)
app.include_router(inventory.router)
app.include_router(upload.router)


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
