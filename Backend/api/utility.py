from fastapi import APIRouter, UploadFile, File
from services.cloudinary.uploader import upload_image as upload_to_cloudinary

router = APIRouter(prefix="/api/v1/utility", tags=["utility"])

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    return await upload_to_cloudinary(file)


