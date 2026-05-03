"""add_password_reset_and_order_status_fields

Revision ID: 5cb3acce045e
Revises: bcc109a22ca7
Create Date: 2026-05-03 23:58:29.351553

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5cb3acce045e'
down_revision: Union[str, Sequence[str], None] = 'bcc109a22ca7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add password reset fields to users table
    op.add_column('users', sa.Column('password_reset_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('reset_token_expiry', sa.DateTime(timezone=True), nullable=True))

    # Add order_status field to orders table
    op.add_column('orders', sa.Column('order_status', sa.String(), server_default="'pending'", nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove order_status from orders table
    op.drop_column('orders', 'order_status')

    # Remove password reset fields from users table
    op.drop_column('users', 'reset_token_expiry')
    op.drop_column('users', 'password_reset_token')
