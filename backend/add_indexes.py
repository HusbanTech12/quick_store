#!/usr/bin/env python3
"""
Script to add performance indexes to the database
Run this once to optimize query performance
"""

from sqlalchemy import text
from app.database import engine

def add_indexes():
    """Add indexes to improve query performance"""

    indexes = [
        # Orders table indexes
        "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);",
        "CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);",
        "CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);",
        "CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);",

        # Order items table indexes
        "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);",
        "CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);",
    ]

    with engine.connect() as conn:
        for idx_sql in indexes:
            try:
                conn.execute(text(idx_sql))
                print(f"✅ {idx_sql.split('idx_')[1].split(' ON')[0]}")
            except Exception as e:
                print(f"⚠️  Error creating index: {e}")

        conn.commit()

    print("\n✅ All indexes created successfully!")
    print("🚀 Your database queries will now be much faster!")

if __name__ == "__main__":
    print("Adding performance indexes to database...\n")
    add_indexes()
