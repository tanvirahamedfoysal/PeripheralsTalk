from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from Backend.auth.utilities import create_token, hash_password, verify_password, verify_token
from Backend.db.database import get_db
from Backend.schemas.auth import UserCreate, UserLogin, ValidateTokenPayload
from Backend.services.brevo.send_email import send_email_service

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

DEFAULT_IMAGE_URL = (
    "https://res.cloudinary.com/dqaj2you5/image/upload/"
    "v1781759446/peripheralstalk/eqrhuu2yxmiaro5rai4f.png"
)
DEFAULT_PUBLIC_ID = "peripheralstalk/eqrhuu2yxmiaro5rai4f"


@router.post("/validate-token")
async def validate_token(
    payload: ValidateTokenPayload
):
    response = verify_token(payload.token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The token is invalid or has expired"
        )
    return {
        "message": "Token is valid",
        "user": response["data"]
    }

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
    if result.first():
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )
    image_url = payload.image_url or DEFAULT_IMAGE_URL
    image_public_id = payload.image_public_id or DEFAULT_PUBLIC_ID
    # Create image record
    image_result = await db.execute(
        text("""
            INSERT INTO peripheralstalk.images
            (
                url, public_id
            )
            VALUES 
            (
                :url, :public_id
            )
            RETURNING id
        """),
        {
            "url": image_url,
            "public_id": image_public_id
        }
    )
    image = image_result.mappings().first()
    # Create user
    user_result = await db.execute(
        text("""
            INSERT INTO peripheralstalk.users
            (
                name, email, hashed_password, image_id
            )
            VALUES
            (
                :name, :email, :password, :image_id
            )
            RETURNING id, role, is_active
        """),
        {
            "name": payload.name,
            "email": payload.email,
            "password": hash_password(payload.password),
            "image_id": image["id"]
        }
    )
    user = user_result.mappings().first()
    await db.commit()
    access_token = create_token(
        {
            "id": str(user["id"]),
            "email": payload.email,
            "role": user["role"]
        }
    )
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": payload.name,
            "email": payload.email,
            "role": user["role"],
            "is_active": user["is_active"],
            "image": {
                "id": image["id"],
                "url": image_url,
                "public_id": image_public_id
            }
        }
    }

@router.post("/login")
async def login(
    user: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            SELECT id, role, is_active, hashed_password
            FROM peripheralstalk.users
            WHERE email = :email
        """),
        {"email": user.email}
    )
    existing_user = result.mappings().first()
    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )
    if not verify_password(user.password, existing_user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )
    access_token = create_token(
        {
            "id": str(existing_user["id"]),
            "email": user.email,
            "role": existing_user["role"]
        }
    )
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "role": existing_user["role"],
            "is_active": existing_user["is_active"]
        }
    }

@router.post("/request-reset-password")
async def request_reset_password():
    email = "tanvirahamed.foysal.00@gmail.com"
    subject = "For Testing Purpose"
    body = "This is the body of the testing email"
    
    return await send_email_service(email, subject, body)


@router.post("/reset-password")
async def reset_password():
    return {
        "message": "Not implemented yet"
    }
