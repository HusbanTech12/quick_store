"""Seed database with sample products"""
import uuid
import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, get_db
from app import models

# Sample products data
SAMPLE_PRODUCTS = [
    {
        "title": "Wireless Bluetooth Headphones",
        "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
        "price": 149.99,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "stock": 50,
        "is_featured": True
    },
    {
        "title": "Premium Leather Wallet",
        "description": "Handcrafted genuine leather wallet with RFID protection.",
        "price": 59.99,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
        "stock": 100,
        "is_featured": True
    },
    {
        "title": "Smart Watch Pro",
        "description": "Advanced smartwatch with health monitoring, GPS, and 7-day battery.",
        "price": 299.99,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "stock": 30,
        "is_featured": True
    },
    {
        "title": "Organic Cotton T-Shirt",
        "description": "Soft, sustainable organic cotton t-shirt in multiple colors.",
        "price": 29.99,
        "category": "Clothing",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "stock": 200,
        "is_featured": False
    },
    {
        "title": "Minimalist Desk Lamp",
        "description": "LED desk lamp with adjustable brightness and color temperature.",
        "price": 79.99,
        "category": "Home",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
        "stock": 75,
        "is_featured": True
    },
    {
        "title": "Stainless Steel Water Bottle",
        "description": "Double-wall insulated bottle keeps drinks cold for 24 hours or hot for 12.",
        "price": 34.99,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        "stock": 150,
        "is_featured": False
    },
    {
        "title": "Wireless Charging Pad",
        "description": "Fast wireless charging pad compatible with all Qi-enabled devices.",
        "price": 39.99,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=400",
        "stock": 80,
        "is_featured": False
    },
    {
        "title": "Canvas Backpack",
        "description": "Durable canvas backpack with laptop compartment and multiple pockets.",
        "price": 69.99,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "stock": 60,
        "is_featured": True
    },
    {
        "title": "Running Shoes Elite",
        "description": "Lightweight running shoes with responsive cushioning and breathable mesh.",
        "price": 129.99,
        "category": "Footwear",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "stock": 45,
        "is_featured": False
    },
    {
        "title": "Ceramic Coffee Mug Set",
        "description": "Set of 4 handcrafted ceramic mugs, perfect for your morning coffee.",
        "price": 44.99,
        "category": "Home",
        "image": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
        "stock": 90,
        "is_featured": False
    },
    {
        "title": "Bluetooth Portable Speaker",
        "description": "Compact Bluetooth speaker with 360° sound and waterproof design.",
        "price": 89.99,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        "stock": 55,
        "is_featured": False
    },
    {
        "title": "Yoga Mat Premium",
        "description": "Extra thick eco-friendly yoga mat with non-slip surface.",
        "price": 49.99,
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
        "stock": 100,
        "is_featured": False
    }
]


def seed_database():
    """Populate database with sample products"""
    db: Session = next(get_db())
    try:
        # Check if products already exist
        existing = db.query(models.Product).count()
        if existing > 0:
            print(f"Database already has {existing} products. Skipping seed.")
            return

        for product_data in SAMPLE_PRODUCTS:
            product = models.Product(**product_data)
            db.add(product)

        db.commit()
        print(f"✅ Successfully seeded {len(SAMPLE_PRODUCTS)} products")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
