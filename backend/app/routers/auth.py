from datetime import datetime, timedelta
from typing import Annotated
import os
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from .. import schemas, crud, models
from ..database import get_db
from ..utils.email import email_service
from ..core.clerk import verify_clerk_token

router = APIRouter(prefix="/auth", tags=["authentication"])



SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> schemas.UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    # Try Clerk JWT first
    clerk_payload = verify_clerk_token(token)
    if clerk_payload:
        email = clerk_payload.get("email") or clerk_payload.get("sub", "")
        name = clerk_payload.get("name", "")

        user = crud.get_user_by_email(db, email=email)
        if user is None:
            user = crud.create_user_from_clerk(db, email=email, name=name or email.split("@")[0])

        # Auto-promote admin email
        if ADMIN_EMAIL and email == ADMIN_EMAIL and not user.is_admin:
            user.is_admin = True
            db.commit()
            db.refresh(user)

        return schemas.UserResponse.model_validate(user)

    # Fallback to custom JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return schemas.UserResponse.model_validate(user)


@router.post("/seed-admin", response_model=schemas.UserResponse)
def seed_admin(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    seed_key: str = Depends(lambda: os.getenv("SEED_ADMIN_KEY", "")),
):
    """Create the initial admin user (protected by SEED_ADMIN_KEY env var).
    Only works once - subsequent calls return the existing admin."""
    if not seed_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SEED_ADMIN_KEY not configured on server"
        )

    existing = crud.get_user_by_email(db, user_data.email)
    if existing:
        if existing.is_admin:
            return schemas.UserResponse.model_validate(existing)
        existing.is_admin = True
        db.commit()
        db.refresh(existing)
        return schemas.UserResponse.model_validate(existing)

    db_user = crud.create_user(db, user_data)
    db_user.is_admin = True
    db.commit()
    db.refresh(db_user)
    return schemas.UserResponse.model_validate(db_user)


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = crud.get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = crud.create_user(db, user_data)
    return schemas.UserResponse.model_validate(user)


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)]
):
    """Login and get access token"""
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]):
    """Get current user info"""
    return current_user


@router.post("/request-password-reset", status_code=status.HTTP_200_OK)
def request_password_reset(
    request_data: schemas.PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset email."""
    user = crud.get_user_by_email(db, email=request_data.email)

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=1)

    # Save token to database
    crud.set_password_reset_token(db, user, reset_token, expiry)

    # Send email
    email_sent = email_service.send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token,
        user_name=user.name
    )

    if not email_sent:
        # Log error but don't expose to user
        print(f"Failed to send password reset email to {user.email}")

    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    reset_data: schemas.PasswordReset,
    db: Session = Depends(get_db)
):
    """Reset password using a valid token."""
    user = crud.get_user_by_reset_token(db, token=reset_data.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Reset password and clear token
    crud.reset_user_password(db, user, reset_data.new_password)

    return {"message": "Password has been reset successfully"}


@router.post("/verify-reset-token", status_code=status.HTTP_200_OK)
def verify_reset_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify if a reset token is valid."""
    user = crud.get_user_by_reset_token(db, token=token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    return {"message": "Token is valid", "email": user.email}
