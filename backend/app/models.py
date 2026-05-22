import uuid

from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column("password", String(255), nullable=False)
    is_admin = Column(Boolean, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Password reset fields
    password_reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)

    # Relationship to orders
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    image = Column(String(500), nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    reorder_threshold = Column(Integer, nullable=False, default=5, server_default="5")
    is_featured = Column(Boolean, default=False, server_default="false")
    is_active = Column(Boolean, default=True, server_default="true", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to order items
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    # Relationship to inventory logs
    inventory_logs = relationship("InventoryLog", back_populates="product", cascade="all, delete-orphan")
    # Relationship to product images
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    total_price = Column(Float, nullable=False)
    shipping_name = Column(String(255), nullable=False)
    shipping_address = Column(Text, nullable=False)
    shipping_city = Column(String(100), nullable=False)
    shipping_email = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    stripe_session_id = Column(String, nullable=True, index=True)
    payment_status = Column(String, nullable=True, index=True)  # 'pending', 'paid', 'failed'
    order_status = Column(String, nullable=False, server_default="'pending'", index=True)  # 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

    # Unique constraint for webhook event tracking
    __table_args__ = (
        UniqueConstraint('stripe_session_id', name='uq_order_payment'),
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    change_type = Column(String(50), nullable=False, index=True)  # 'sale', 'restock', 'return', 'adjustment', 'cancellation'
    quantity_change = Column(Integer, nullable=False)  # positive = added, negative = removed
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    reference_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # order_id, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships
    product = relationship("Product", back_populates="inventory_logs")
    created_user = relationship("User")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    secure_url = Column(String(500), nullable=False)
    public_id = Column(String(255), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    resource_type = Column(String(20), nullable=False, default="image")
    is_primary = Column(Boolean, default=False, server_default="false")
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="images")
