from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer

from auth.utilities import validate_user_access, validate_admin_access
from db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

@router.get("/profile-photo")
async def get_profile_photo(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]

    result = await db.execute(
        text("""
            SELECT i.id, i.url, i.public_id
            FROM peripheralstalk.users u
            LEFT JOIN peripheralstalk.images i ON u.image_id = i.id
            WHERE u.id = :user_id
        """),
        {"user_id": int(user_id)}
    )
    image = result.mappings().first()
    if not image:
        return {
            "is_successful": True,
            "message": "No profile image found",
            "image": None
        }
    return {
        "is_successful": True,
        "image": {
            "url": image["url"],
            "public_id": image["public_id"]
        }
    }


@router.post("/validate-username")
async def check_username_validity(username:str, db: AsyncSession = Depends(get_db)):
    return {
        "message": "Not implemented yet"
    }


@router.get("/all")
async def get_all_users(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    try:
        result = await db.execute(
            text("""
                SELECT  u.id, u.name, u.username, u.email, u.role, u.is_active, i.url AS image_url
                FROM peripheralstalk.users u LEFT JOIN peripheralstalk.images i 
                ON u.image_id = i.id
                ORDER BY u.id ASC
            """)
        )
        users = result.mappings().all()
        return {
            "is_successful": True,
            "total_users": len(users),
            "users": users
        }
    except Exception as e:
        print(f"FAILED TO FETCH USERS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch users from the database"
        )

@router.get("/me")
async def get_profile(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }

@router.put("/me")
async def update_profile(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }

@router.delete("/me")
async def delete_profile(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }

@router.post("/request-for-editor-access")
async def request_for_editor_access(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }
