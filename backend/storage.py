import os
import mimetypes
from typing import Optional

from fastapi import HTTPException, UploadFile

from database import supabase, SUPABASE_URL

COURSE_BUCKET = os.getenv("SUPABASE_COURSE_BUCKET", "course-content")
PROFILE_BUCKET = os.getenv("SUPABASE_PROFILE_BUCKET", "profile-pictures")
PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "http://localhost:8000").rstrip("/")


def storage_enabled() -> bool:
    return supabase is not None and bool(SUPABASE_URL)


def public_storage_url(bucket: str, path: str) -> str:
    base = SUPABASE_URL.rstrip("/")
    return f"{base}/storage/v1/object/public/{bucket}/{path}"


def _guess_content_type(filename: str) -> str:
    content_type, _ = mimetypes.guess_type(filename)
    return content_type or "application/octet-stream"


def upload_to_supabase(
    bucket: str,
    path: str,
    data: bytes,
    filename: str,
) -> str:
    if not storage_enabled():
        raise HTTPException(
            status_code=500,
            detail="Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )

    content_type = _guess_content_type(filename)
    try:
        supabase.storage.from_(bucket).upload(
            path,
            data,
            file_options={"content-type": content_type, "upsert": "true"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file to Supabase: {exc}",
        ) from exc

    return public_storage_url(bucket, path)


async def read_upload(file: UploadFile) -> bytes:
    data = await file.read()
    await file.close()
    return data


async def upload_course_content(file: UploadFile, filename: str) -> str:
    data = await read_upload(file)
    return upload_to_supabase(COURSE_BUCKET, filename, data, file.filename or filename)


async def upload_profile_picture(file: UploadFile, filename: str) -> str:
    data = await read_upload(file)
    return upload_to_supabase(PROFILE_BUCKET, filename, data, file.filename or filename)


def save_course_content_local(
    file: UploadFile,
    directory: str,
    filename: str,
) -> str:
    file_path = os.path.join(directory, filename)
    try:
        with open(file_path, "wb") as buffer:
            file.file.seek(0)
            buffer.write(file.file.read())
    finally:
        file.file.close()
    return f"{PUBLIC_API_URL}/uploads/course_content/{filename}"


def save_profile_picture_local(
    data: bytes,
    directory: str,
    filename: str,
) -> str:
    file_path = os.path.join(directory, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(data)
    return f"/uploads/profile_pictures/{filename}"
