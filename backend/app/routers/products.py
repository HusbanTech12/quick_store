from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi import Response
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


def require_admin(current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]):
    """Check if current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|price|title|stock)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    featured_only: bool = Query(False)
):
    """Get all products with filtering and pagination"""
    products, total = crud.get_products(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        featured_only=featured_only
    )
    response.headers["X-Total-Count"] = str(total)
    return [schemas.ProductResponse.model_validate(p) for p in products]


@router.get("/categories", response_model=List[str])
def get_categories(db: Annotated[Session, Depends(get_db)]):
    """Get all unique categories"""
    return crud.get_categories(db)


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(
    product_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)]
):
    """Get product by ID"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return schemas.ProductResponse.model_validate(product)


@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Create a new product (Admin only)"""
    return schemas.ProductResponse.model_validate(crud.create_product(db, product))


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: uuid.UUID,
    product_update: schemas.ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Update product (Admin only)"""
    product = crud.update_product(db, product_id, product_update)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return schemas.ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(require_admin)]
):
    """Delete product (Admin only)"""
    success = crud.delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return None
