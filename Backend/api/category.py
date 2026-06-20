from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db

from auth.utilities import validate_admin_access

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/category", tags=["category"])


@router.get("/")
async def get_categories():
    # return active article id also
    return {
        "message": "Not implemented yet"
    }

@router.get("/{id}")
async def get_category(id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/")
async def create_category(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }

@router.put("/{id}")
async def update_category(id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }

@router.delete("/{id}")
async def delete_category(id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }
