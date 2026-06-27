from fastapi import APIRouter, Depends, UploadFile, File
from services.cloudinary.uploader import upload_image as upload_to_cloudinary

router = APIRouter(prefix="/api/v1/utility", tags=["utility"])

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    return await upload_to_cloudinary(file)




from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import time
from time import perf_counter
from db.database import get_db, engine

@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    start = time.perf_counter()
    await db.execute(text("SELECT 1"))
    elapsed = time.perf_counter() - start
    return {"db_time": elapsed}


@router.get("/db-debug")
async def db_debug():
    t1 = perf_counter()
    async with engine.connect() as conn:
        t2 = perf_counter()
        await conn.execute(text("SELECT 1"))
        t3 = perf_counter()
    return {
        "connect_time": round(t2 - t1, 3),
        "query_time": round(t3 - t2, 3),
        "total_time": round(t3 - t1, 3),
    }