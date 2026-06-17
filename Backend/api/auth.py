from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from Backend.auth.utilities import hash_password
from Backend.db.database import get_db
from Backend.schemas.auth import UserCreate, UserLogin

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["authentication"]
)

@router.post("/register")
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            SELECT id
            FROM peripheralstalk.users
            WHERE email = :email
        """),
        {"email": payload.email}
    )

    existing_user = result.first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    await db.execute(
        text("""
            INSERT INTO peripheralstalk.users
            (
                name,
                email,
                hashed_password
            )
            VALUES
            (
                :name,
                :email,
                :password
            )
        """),
        {
            "name": payload.name,
            "email": payload.email,
            "password": hash_password(payload.password)
        }
    )

    await db.commit()

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
async def login(
    user: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    return {
        "message": "Not implemented yet"
    }

@router.post("/request-reset-password")
async def request_reset_password():
    return {
        "message": "Not implemented yet"
    }

@router.post("/reset-password")
async def reset_password():
    return {
        "message": "Not implemented yet"
    }
