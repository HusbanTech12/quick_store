from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.schema import ForeignKeyConstraint

# ... (existing model imports and class definitions) ...

class Order(Base):
    __tablename__ = "orders"

    # ... (existing fields) ...

    stripe_session_id = Column(String, nullable=True)
    payment_status = Column(String, nullable=True)  # 'pending', 'paid', 'failed'

    # Add unique constraint for webhook event tracking
    __table_args__ = (
        UniqueConstraint(
            'stripe_session_id',
            'webhook_event_id',
            name='uq_order_payment'
        ),
    )

    # ... (existing methods if any) ...
