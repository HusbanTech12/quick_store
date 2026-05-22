import cloudinary
import cloudinary.uploader
import cloudinary.api
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


def upload_media(file, folder: str = "shop_pk", resource_type: str = "auto") -> dict:
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type=resource_type,
        transformation=[
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "width": result.get("width"),
        "height": result.get("height"),
        "resource_type": result.get("resource_type", "image"),
        "format": result.get("format"),
        "bytes": result.get("bytes"),
    }


def delete_media(public_id: str, resource_type: str = "image") -> bool:
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception:
        return False


def list_media(folder: str = "shop_pk", max_results: int = 100) -> dict:
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix=folder,
            max_results=max_results,
            resource_type="image",
        )
        images = [
            {
                "public_id": r["public_id"],
                "secure_url": r["secure_url"],
                "width": r.get("width"),
                "height": r.get("height"),
                "resource_type": r.get("resource_type", "image"),
                "format": r.get("format"),
                "bytes": r.get("bytes"),
                "created_at": r.get("created_at"),
            }
            for r in result.get("resources", [])
        ]
        return {"images": images, "total_count": len(images)}
    except Exception as e:
        return {"images": [], "total_count": 0, "error": str(e)}
