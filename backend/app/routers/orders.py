from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


def require_admin(current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]):
    """Check if current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Create a new order"""
    try:
        db_order = crud.create_order(db, order, user_id=current_user.id)
        return schemas.OrderResponse.model_validate(db_order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[schemas.OrderSummary])
def get_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 20
):
    """Get orders for current user"""
    orders = crud.get_orders(db, skip=skip, limit=limit, user_id=current_user.id)
    return [
        schemas.OrderSummary(
            id=o.id,
            user_id=o.user_id,
            total_price=o.total_price,
            created_at=o.created_at,
            item_count=len(o.items),
            payment_status=o.payment_status,
            order_status=o.order_status
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Get order by ID (user can only see their own orders)"""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )

    return schemas.OrderResponse.model_validate(order)


@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: uuid.UUID,
    status_update: schemas.OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Update order status (admin only or user can cancel their own orders)"""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Users can only cancel their own orders
    if not current_user.is_admin:
        if order.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this order"
            )
        if status_update.order_status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only cancel orders"
            )
        if order.order_status in ["shipped", "delivered"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel orders that have been shipped or delivered"
            )

    try:
        updated_order = crud.update_order_status(db, order_id, status_update.order_status)
        return schemas.OrderResponse.model_validate(updated_order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/admin/all", response_model=List[schemas.OrderSummary])
def get_all_orders_admin(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)],
    skip: int = 0,
    limit: int = 50
):
    """Get all orders (Admin only)"""
    orders = crud.get_orders(db, skip=skip, limit=limit, user_id=None)
    return [
        schemas.OrderSummary(
            id=o.id,
            user_id=o.user_id,
            total_price=o.total_price,
            created_at=o.created_at,
            item_count=len(o.items),
            payment_status=o.payment_status,
            order_status=o.order_status
        )
        for o in orders
    ]
