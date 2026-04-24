from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint, Float
from sqlalchemy.orm import relationship
from .database import Base  # Import Base from database module

# Base class for all models
class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default='CURRENT_TIMESTAMP')
    updated_at = Column(DateTime, onupdate='CURRENT_TIMESTAMP')

    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_order_item'),
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")