import random
from typing import Annotated
from datetime import UTC, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import  OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from auth.utilities import create_token, hash_password, verify_password, verify_token
from db.database import get_db
from schemas.auth import RegisterRequest, RequestOTP, ValidateTokenPayload, ResetPasswordRequest
from services.brevo.send_email import send_email_service

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


DEFAULT_IMAGE_URL = "https://res.cloudinary.com/dqaj2you5/image/upload/v1781759446/peripheralstalk/eqrhuu2yxmiaro5rai4f.png"
DEFAULT_PUBLIC_ID = "peripheralstalk/eqrhuu2yxmiaro5rai4f"


@router.post("/validate-token")
async def validate_token(
    payload: ValidateTokenPayload
):
    response = verify_token(payload.token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The token is invalid or has expired"
        )
    return {
        "message": "Token is valid",
        "user": response["data"]
    }

@router.post("/request-registration-otp")
async def request_registration_otp(
    payload: RequestOTP,
    db: AsyncSession = Depends(get_db)
):
    existing_user = (
        await db.execute(
            text("""
                SELECT id
                FROM peripheralstalk.users
                WHERE email = :email
            """),
            {"email": payload.email}
        )
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    otp = str(random.randint(100000, 999999))
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

    expires_at = datetime.now(UTC) + timedelta(minutes=2)
    await db.execute(
        text("""
            INSERT INTO peripheralstalk.email_otps
            (
                email, otp, purpose, expires_at, is_used
            )
            VALUES
            (
                :email, :otp, 'REGISTER', :expires_at, FALSE
            )
        """),
        {
            "email": payload.email,
            "otp": otp,
            "expires_at": expires_at
        }
    )
    await db.commit()
    await send_email_service(
        payload.email,
        "Email Verification",
        f"""
        Hello,
        Your registration OTP is:
        {otp}
        This OTP will expire in 2 minutes.
        If you did not request this verification, please ignore this email.
        """
    )
    return {
        "is_successful": True,
        "message": "OTP sent successfully."
    }


@router.post("/register")
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    otp_record = (
        await db.execute(
            text("""
                SELECT id, is_used, expires_at
                FROM peripheralstalk.email_otps
                WHERE email = :email
                AND otp = :otp
                AND purpose = 'REGISTER'
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {
                "email": payload.email,
                "otp": payload.otp
            }
        )
    ).mappings().first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    if otp_record["is_used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP already used"
        )
    if otp_record["expires_at"] < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )
    
    existing_user = (
        await db.execute(
            text("""
                SELECT id
                FROM peripheralstalk.users
                WHERE email = :email
                   OR username = :username
            """),
            {
                "email": payload.email,
                "username": payload.username
            }
        )
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already exists"
        )

    image_url = payload.image_url or DEFAULT_IMAGE_URL
    image_public_id = payload.image_public_id or DEFAULT_PUBLIC_ID

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

    user_result = await db.execute(
        text("""
            INSERT INTO peripheralstalk.users
            (
                name, username, email, password, image_id
            )
            VALUES
            (
                :name, :username, :email, :password, :image_id
            )
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
        {"id": otp_record["id"]}
    )
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

@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    identifier = form_data.username
    password = form_data.password

    result = await db.execute(
        text("""
            SELECT id, username, email, role, is_active, password
            FROM peripheralstalk.users
            WHERE username = :identifier
               OR email = :identifier
        """),
        {
            "identifier": identifier
        }
    )
    user = result.mappings().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username/email or password"
        )
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username/email or password"
        )
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_token(
        {
            "id": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }
    )
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user["is_active"]
        }
    }

@router.post("/request-reset-password")
async def request_reset_password(
    payload: RequestOTP,
    db: AsyncSession = Depends(get_db)
):
    
    user = (
        await db.execute(
            text("""
                SELECT id, email
                FROM peripheralstalk.users
                WHERE email = :email
            """),
            {"email": payload.email}
        )
    ).mappings().first()

    if not user:
        return {
            "is_successful": True,
            "message": "If the email exists, an OTP has been sent."
        }

    otp = str(random.randint(100000, 999999))
    receiver = payload.email
    subject = "Password Reset Request"
    body = f"""
        Hello,
        Your password reset OTP is:
        {otp}
        This OTP will expire in 2 minutes.
        If you did not request a password reset, you can safely ignore this email.
    """
    await db.execute(
        text("""
            UPDATE peripheralstalk.email_otps
            SET is_used = TRUE
            WHERE email = :email
            AND purpose = 'PASSWORD_RESET'
            AND is_used = FALSE
        """),
        {"email": payload.email}
    )

    expires_at = datetime.now(UTC) + timedelta(minutes=2)
    await db.execute(
        text("""
            INSERT INTO peripheralstalk.email_otps
            (
                email, otp, purpose, expires_at, is_used
            )
            VALUES
            (
                :email, :otp, 'PASSWORD_RESET', :expires_at, FALSE
            )
        """),
        {
            "email": payload.email,
            "otp": otp,
            "expires_at": expires_at
        }
    )
    await db.commit()

    await send_email_service(
        receiver,
        subject,
        body
    )
    return {
        "is_successful": True,
        "message": "OTP sent successfully. Please check your email."
    }

@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    otp_record = (
        await db.execute(
            text("""
                SELECT id, email, otp, expires_at, is_used
                FROM peripheralstalk.email_otps
                WHERE email = :email
                AND otp = :otp
                AND purpose = 'PASSWORD_RESET'
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {
                "email": payload.email,
                "otp": payload.otp
            }
        )
    ).mappings().first()

    if not otp_record:
        return {
            "is_successful": False,
            "message": "Invalid OTP."
        }
    if otp_record["is_used"]:
        return {
            "is_successful": False,
            "message": "OTP has already been used."
        }
    if otp_record["expires_at"] < datetime.now(UTC):
        return {
            "is_successful": False,
            "message": "OTP has expired."
        }

    hashed_password = hash_password(payload.new_password)

    await db.execute(
        text("""
            UPDATE peripheralstalk.users
            SET password = :password
            WHERE email = :email
        """),
        {
            "password": hashed_password,
            "email": payload.email
        }
    )
    await db.execute(
        text("""
            UPDATE peripheralstalk.email_otps
            SET is_used = TRUE
            WHERE id = :id
        """),
        {
            "id": otp_record["id"]
        }
    )
    await db.commit()

    return {
        "is_successful": True,
        "message": "Password reset successful."
    }