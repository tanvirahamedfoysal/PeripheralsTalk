from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from auth.utilities import validate_editor_access, validate_admin_access, validate_user_access
from db.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/article", tags=["article"])



@router.get("/{article_id}")
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    return {
        "message": "Not implemented yet"
    }


@router.post("/{article_id}")
async def update_article(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_editor_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    return {
        "message": "Not implemented yet"
    }


@router.get("/{category_id}/all-articles")
async def get_all_articles(category_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/{category_id}/make-active/{article_id}")
async def make_article_active(category_id: int, article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.delete("/{article_id}")
async def delete_article(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/{article_id}/vote")
async def vote_article(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/toggle_favourite/{article_id}")
async def toggle_favourite(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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

