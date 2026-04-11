from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
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


@router.get("/", response_model=List[schemas.OrderSummary])
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
            item_count=len(o.items)
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
