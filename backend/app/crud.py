from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional, Tuple
from . import models, schemas
import bcrypt
import uuid
import stripe
import os
from datetime import datetime

# ... existing code ...

# ========== Payment-Related CRUD ==========

def create_order_with_payment(db: Session, order: schemas.OrderCreate, user_id: Optional[uuid.UUID] = None) -> models.Order:
    # First create the order with 'pending' status
    total = 0.0
    order_items = []

    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise ValueError(f"Insufficient stock for product {product.title}")

        price = item.price if item.price else product.price
        total += price * item.quantity
        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": price
        })

    db_order = models.Order(
        id=uuid.uuid4(),
        user_id=user_id,
        total_price=total,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_email=order.shipping_email,
        stripe_session_id=None,
        payment_status="pending"
    )
    db.add(db_order)
    db.flush()

    for item_data in order_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)

        # Reduce stock
        product = get_product(db, item_data["product_id"])
        product.stock -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_payment_status(db: Session, order_id: uuid.UUID, payment_status: str, stripe_session_id: Optional[str] = None):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")

    order.payment_status = payment_status
    if stripe_session_id:
        order.stripe_session_id = stripe_session_id

    db.commit()
    db.refresh(order)
    return order

def get_order_by_stripe_session(db: Session, stripe_session_id: str):
    return db.query(models.Order).filter(models.Order.stripe_session_id == stripe_session_id).first()
