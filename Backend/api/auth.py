import random
from typing import Annotated
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth.utilities import create_token, hash_password, verify_password, verify_token
from db.database import get_db
from schemas.auth import (
    RegisterRequest,
    RequestOTP,
    ValidateTokenPayload,
    ResetPasswordRequest
)
from services.brevo.send_email import send_email_service


DEFAULT_IMAGE_URL = "https://res.cloudinary.com/dqaj2you5/image/upload/v1781759446/peripheralstalk/eqrhuu2yxmiaro5rai4f.png"
DEFAULT_PUBLIC_ID = "peripheralstalk/eqrhuu2yxmiaro5rai4f"


router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# -------------------------
# VALIDATE TOKEN
# -------------------------
@router.post("/validate-token")
async def validate_token(token: str = Depends(oauth2_scheme)):
    response = verify_token(token)

    if not response["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"message": "Token is valid", "user": response["data"]}


# -------------------------
# REGISTER OTP
# -------------------------
@router.post("/request-registration-otp")
async def request_registration_otp(payload: RequestOTP, db: AsyncSession = Depends(get_db)):
    # Transaction begins implicitly here
    existing_user = await db.execute(
        text("SELECT id FROM peripheralstalk.users WHERE email = :email"),
        {"email": payload.email}
    )

    if existing_user.first():
        raise HTTPException(status_code=400, detail="Email already exists")

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=2)

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.email_otps
                SET is_used = TRUE
                WHERE email = :email
                AND purpose = 'REGISTER'
                AND is_used = FALSE
            """),
            {"email": payload.email}
        )

        await db.execute(
            text("""
                INSERT INTO peripheralstalk.email_otps
                (email, otp, purpose, expires_at, is_used)
                VALUES (:email, :otp, 'REGISTER', :expires_at, FALSE)
            """),
            {
                "email": payload.email,
                "otp": otp,
                "expires_at": expires_at
            }
        )

        await db.commit()

    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to generate OTP")

    # Email OUTSIDE transaction
    try:
        await send_email_service(
            payload.email,
            "Email Verification",
            f"Your OTP is {otp}. It expires in 2 minutes."
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

    return {"is_successful": True, "message": "OTP sent successfully"}


# -------------------------
# REGISTER
# -------------------------
@router.post("/register")
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    
    # Transaction begins implicitly here
    otp_record = (
        await db.execute(
            text("""
                SELECT id, email, otp, expires_at, is_used
                FROM peripheralstalk.email_otps
                WHERE email = :email
                AND otp = :otp
                AND purpose = 'REGISTER'
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"email": payload.email, "otp": payload.otp}
        )
    ).mappings().first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record["is_used"]:
        raise HTTPException(status_code=400, detail="OTP already used")

    if otp_record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    existing_user = (
        await db.execute(
            text("""
                SELECT id FROM peripheralstalk.users
                WHERE email = :email OR username = :username
            """),
            {"email": payload.email, "username": payload.username}
        )
    ).mappings().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    image_url = payload.image_url or DEFAULT_IMAGE_URL
    image_public_id = payload.image_public_id or DEFAULT_PUBLIC_ID

    try:
        image_result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.images (url, public_id)
                VALUES (:url, :public_id)
                RETURNING id
            """),
            {"url": image_url, "public_id": image_public_id}
        )
        image = image_result.mappings().first()

        user_result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.users
                (name, username, email, password, image_id)
                VALUES (:name, :username, :email, :password, :image_id)
                RETURNING id, role, is_active
            """),
            {
                "name": payload.name,
                "username": payload.username,
                "email": payload.email,
                "password": hash_password(payload.password),
                "image_id": image["id"]
            }
        )
        user = user_result.mappings().first()

        await db.execute(
            text("""
                UPDATE peripheralstalk.email_otps
                SET is_used = TRUE
                WHERE id = :id
            """),
            {"id": int(otp_record["id"])}
        )

        await db.commit()

    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

    token = create_token({
        "id": str(user["id"]),
        "email": payload.email,
        "role": user["role"]
    })

    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": payload.name,
            "username": payload.username,
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


# -------------------------
# LOGIN
# -------------------------
@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        text("""
            SELECT id, username, email, role, is_active, password
            FROM peripheralstalk.users
            WHERE username = :id OR email = :id
        """),
        {"id": form_data.username}
    )

    user = result.mappings().first()

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Inactive account")

    return {
        "message": "Login successful",
        "access_token": create_token({
            "id": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }), 
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }


# -------------------------
# REQUEST RESET PASSWORD
# -------------------------
@router.post("/request-reset-password")
async def request_reset_password(payload: RequestOTP, db: AsyncSession = Depends(get_db)):

    # Transaction begins implicitly here
    user = (
        await db.execute(
            text("SELECT id FROM peripheralstalk.users WHERE email = :email"),
            {"email": payload.email}
        )
    ).mappings().first()

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=2)

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.email_otps
                SET is_used = TRUE
                WHERE email = :email
                AND purpose = 'PASSWORD_RESET'
            """),
            {"email": payload.email}
        )

        await db.execute(
            text("""
                INSERT INTO peripheralstalk.email_otps
                (email, otp, purpose, expires_at, is_used)
                VALUES (:email, :otp, 'PASSWORD_RESET', :expires_at, FALSE)
            """),
            {"email": payload.email, "otp": otp, "expires_at": expires_at}
        )

        await db.commit()

    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process reset request")

    if user:
        try:
            await send_email_service(
                payload.email,
                "Password Reset",
                f"Your OTP is {otp}"
            )
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")

    return {"is_successful": True, "message": "If email exists, OTP sent"}


# -------------------------
# RESET PASSWORD
# -------------------------
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):

    # Transaction begins implicitly here
    otp_record = (
        await db.execute(
            text("""
                SELECT id, expires_at, is_used
                FROM peripheralstalk.email_otps
                WHERE email = :email
                AND otp = :otp
                AND purpose = 'PASSWORD_RESET'
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"email": payload.email, "otp": payload.otp}
        )
    ).mappings().first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record["is_used"]:
        raise HTTPException(status_code=400, detail="OTP already used")

    if otp_record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.users
                SET password = :password
                WHERE email = :email
            """),
            {
                "password": hash_password(payload.new_password),
                "email": payload.email
            }
        )

        await db.execute(
            text("""
                UPDATE peripheralstalk.email_otps
                SET is_used = TRUE
                WHERE id = :id
            """),
            {"id": int(otp_record["id"])}
        )

        await db.commit()

    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Password reset failed")

    return {"is_successful": True, "message": "Password reset successful"}