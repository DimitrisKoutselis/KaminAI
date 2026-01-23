"""Image upload API endpoints."""

import uuid
import os
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import FileResponse

from src.presentation.api.dependencies import get_current_admin

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = Path("/app/uploads") if os.path.exists("/app") else Path("./uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB


@router.post("/images")
async def upload_image(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_admin),
):
    """Upload an image file. Returns the URL to access the image."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "filename": unique_filename,
        "url": f"/api/v1/uploads/images/{unique_filename}",
        "markdown": f"![{file.filename}](/api/v1/uploads/images/{unique_filename})",
    }


@router.get("/images/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image."""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    ext = Path(filename).suffix.lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
    }
    content_type = content_types.get(ext, "application/octet-stream")

    return FileResponse(file_path, media_type=content_type)
