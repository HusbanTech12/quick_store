from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/inventory", tags=["inventory"])


def require_admin(current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]):
    """Check if current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


@router.get("/stats", response_model=schemas.InventoryStats)
def get_inventory_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Get aggregate inventory statistics (Admin only)"""
    stats = crud.get_inventory_stats(db)
    return schemas.InventoryStats(**stats)


@router.get("/products", response_model=List[schemas.ProductInventoryResponse])
def get_inventory_products(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    low_stock: bool = Query(False),
    out_of_stock: bool = Query(False),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Get all products with inventory details (Admin only)"""
    from sqlalchemy import func, or_

    query = db.query(schemas.ProductInventoryResponse.__annotations__)  # We'll use raw query
    # Use the Product model directly
    from .. import models

    product_query = db.query(models.Product).filter(models.Product.is_active.is_(True))

    if low_stock:
        product_query = product_query.filter(
            models.Product.stock > 0,
            models.Product.stock <= models.Product.reorder_threshold
        )
    if out_of_stock:
        product_query = product_query.filter(models.Product.stock == 0)
    if category:
        product_query = product_query.filter(models.Product.category == category)
    if search:
        pattern = f"%{search.lower()}%"
        product_query = product_query.filter(
            func.lower(models.Product.title).like(pattern)
        )

    total = product_query.count()
    products = product_query.order_by(models.Product.stock.asc()).offset(skip).limit(limit).all()

    result = []
    for p in products:
        result.append(schemas.ProductInventoryResponse(
            id=p.id,
            title=p.title,
            category=p.category,
            price=p.price,
            stock=p.stock,
            reorder_threshold=p.reorder_threshold,
            is_active=p.is_active,
            image=p.image,
            created_at=p.created_at,
        ))

    return result


@router.get("/low-stock", response_model=List[schemas.ProductInventoryResponse])
def get_low_stock_products(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Get products with stock at or below reorder threshold (Admin only)"""
    products, total = crud.get_low_stock_products(db, skip=skip, limit=limit)
    return [
        schemas.ProductInventoryResponse(
            id=p.id,
            title=p.title,
            category=p.category,
            price=p.price,
            stock=p.stock,
            reorder_threshold=p.reorder_threshold,
            is_active=p.is_active,
            image=p.image,
            created_at=p.created_at,
        )
        for p in products
    ]


@router.post("/{product_id}/adjust", response_model=schemas.ProductInventoryResponse)
def adjust_product_stock(
    product_id: uuid.UUID,
    adjustment: schemas.StockAdjustment,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Adjust product stock level (Admin only)"""
    try:
        product = crud.adjust_stock(
            db=db,
            product_id=product_id,
            quantity_change=adjustment.quantity_change,
            change_type=adjustment.change_type,
            notes=adjustment.notes,
            created_by=current_user.id,
        )
        return schemas.ProductInventoryResponse(
            id=product.id,
            title=product.title,
            category=product.category,
            price=product.price,
            stock=product.stock,
            reorder_threshold=product.reorder_threshold,
            is_active=product.is_active,
            image=product.image,
            created_at=product.created_at,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{product_id}/reorder-threshold", response_model=schemas.ProductInventoryResponse)
def update_reorder_threshold(
    product_id: uuid.UUID,
    body: dict,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Update reorder threshold for a product (Admin only)"""
    threshold = body.get("reorder_threshold")
    if threshold is None or threshold < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reorder_threshold must be a non-negative integer"
        )

    from .. import models
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product.reorder_threshold = threshold
    db.commit()
    db.refresh(product)

    return schemas.ProductInventoryResponse(
        id=product.id,
        title=product.title,
        category=product.category,
        price=product.price,
        stock=product.stock,
        reorder_threshold=product.reorder_threshold,
        is_active=product.is_active,
        image=product.image,
        created_at=product.created_at,
    )


@router.get("/{product_id}/logs", response_model=List[schemas.InventoryLogResponse])
def get_product_logs(
    product_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    change_type: Optional[str] = Query(None),
):
    """Get inventory change logs for a product (Admin only)"""
    # Check product exists
    from .. import models
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    logs, total = crud.get_inventory_logs(
        db=db,
        product_id=product_id,
        change_type=change_type,
        skip=skip,
        limit=limit,
    )

    return [
        schemas.InventoryLogResponse(
            id=log.id,
            product_id=log.product_id,
            change_type=log.change_type,
            quantity_change=log.quantity_change,
            previous_stock=log.previous_stock,
            new_stock=log.new_stock,
            notes=log.notes,
            reference_id=log.reference_id,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.post("/bulk-update", response_model=List[schemas.ProductInventoryResponse])
def bulk_update_stock(
    bulk_update: schemas.BulkStockUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Update stock for multiple products at once (Admin only)"""
    items = [item.model_dump() for item in bulk_update.items]
    products = crud.bulk_update_stock(db, items, created_by=current_user.id)

    return [
        schemas.ProductInventoryResponse(
            id=p.id,
            title=p.title,
            category=p.category,
            price=p.price,
            stock=p.stock,
            reorder_threshold=p.reorder_threshold,
            is_active=p.is_active,
            image=p.image,
            created_at=p.created_at,
        )
        for p in products
    ]
