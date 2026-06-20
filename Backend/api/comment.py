from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from auth.utilities import validate_admin_access, validate_user_access

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/comment", tags=["comment"])

@router.post("/{article_id}")
async def create_comment(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.get("/{article_id}")
async def get_comments(article_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/{comment_id}")
async def create_nested_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.delete("/{comment_id}")
async def delete_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.put("/{comment_id}")
async def update_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/{comment_id}/up-vote")
async def up_vote_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/{comment_id}/down-vote")
async def down_vote_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/{comment_id}/report")
async def report_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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
