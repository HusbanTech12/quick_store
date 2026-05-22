from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from .. import schemas
from ..routers.auth import get_current_user
from ..utils.cloudinary import upload_image

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/image")
def upload_product_image(
    file: Annotated[UploadFile, File(...)],
    current_user: Annotated[schemas.UserResponse, Depends(get_current_user)]
):
    """Upload an image to Cloudinary (authenticated users only)"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )

    # Validate file size (max 5MB)
    contents = file.file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )

    try:
        # Reset file pointer
        file.file.seek(0)
        result = upload_image(file.file, folder="shop_pk/products")
        return {"url": result["url"], "public_id": result["public_id"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
