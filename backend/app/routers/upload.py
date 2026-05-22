from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, crud
from ..database import get_db
from ..routers.auth import get_current_user
from ..utils.cloudinary import upload_media, delete_media, list_media

router = APIRouter(prefix="/upload", tags=["upload"])


MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/webm", "video/ogg", "video/quicktime",
}


@router.post("", response_model=schemas.MediaUploadResponse)
def upload_file(
    file: Annotated[UploadFile, File(...)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    folder: str = Query("shop_pk/uploads", description="Cloudinary folder path"),
    product_id: Optional[uuid.UUID] = Query(None, description="Attach to product gallery"),
):
    """Upload an image or video to Cloudinary (authenticated users only)."""
    if not file.content_type or file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' is not allowed. Allowed: images and videos"
        )

    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 50MB"
        )

    is_video = file.content_type and file.content_type.startswith("video/")
    resource_type = "video" if is_video else "image"

    try:
        file.file.seek(0)
        result = upload_media(file.file, folder=folder, resource_type=resource_type)

        if product_id:
            image_data = schemas.ProductImageCreate(
                product_id=product_id,
                secure_url=result["url"],
                public_id=result["public_id"],
                width=result.get("width"),
                height=result.get("height"),
                resource_type=result.get("resource_type", "image"),
                is_primary=False,
            )
            crud.add_product_image(db, image_data)

        return schemas.MediaUploadResponse(
            url=result["url"],
            public_id=result["public_id"],
            width=result.get("width"),
            height=result.get("height"),
            resource_type=result.get("resource_type", "image"),
            format=result.get("format"),
            bytes=result.get("bytes"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.delete("/{public_id:path}", response_model=schemas.MediaDeleteResponse)
def delete_uploaded_file(
    public_id: str,
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    resource_type: str = Query("image"),
):
    """Delete a file from Cloudinary by public_id."""
    try:
        crud.delete_product_image_by_public_id(db, public_id)
    except Exception:
        pass

    success = delete_media(public_id, resource_type=resource_type)
    return schemas.MediaDeleteResponse(success=success, public_id=public_id)


@router.get("/media", response_model=schemas.MediaListResponse)
def list_uploaded_media(
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)],
    folder: str = Query("shop_pk", description="Cloudinary folder to list"),
    max_results: int = Query(100, ge=1, le=500),
):
    """List all media files in a Cloudinary folder."""
    result = list_media(folder=folder, max_results=max_results)
    return schemas.MediaListResponse(
        images=[schemas.MediaItem(**img) for img in result["images"]],
        total_count=result["total_count"],
    )


@router.get("/stats", response_model=schemas.UploadStats)
def get_upload_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)],
):
    """Get upload statistics."""
    return crud.get_upload_stats(db)
