"""add stripe payment fields

Revision ID: 002_add_stripe_payment_fields
Revises: 001_initial_migration
Create Date: 2026-05-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "002_add_stripe_payment_fields"
down_revision = "001_initial_migration"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add Stripe payment fields to orders table
    op.add_column("orders", sa.Column("stripe_session_id", sa.String(255), nullable=True))
    op.add_column("orders", sa.Column("payment_status", sa.String(50), nullable=True, server_default="pending"))

    # Create unique index on stripe_session_id
    op.create_index("ix_orders_stripe_session_id", "orders", ["stripe_session_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_orders_stripe_session_id", table_name="orders")
    op.drop_column("orders", "payment_status")
    op.drop_column("orders", "stripe_session_id")
