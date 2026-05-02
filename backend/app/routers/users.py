from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_profile(
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
async def update_current_user_profile(
    user_update: schemas.UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Update current user profile"""
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = crud.get_user_by_email(db, user_update.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    updated_user = crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return schemas.UserResponse.model_validate(updated_user)


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: schemas.PasswordChange,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Change current user password"""
    # Get user from database to verify current password
    db_user = crud.get_user(db, current_user.id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify current password
    if not crud.verify_password(password_data.current_password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    crud.update_user_password(db, current_user.id, password_data.new_password)

    return {"message": "Password changed successfully"}


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_by_id(
    user_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Get user by ID (admin or self only)"""
    # Users can only view their own profile unless they're admin
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )

    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return schemas.UserResponse.model_validate(user)
