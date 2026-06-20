from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from auth.utilities import validate_admin_access

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
    
@router.get("/get-editor-request")
async def get_editor_request(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/make-editor/{user_id}")
async def make_editor(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/revoke-editor/{user_id}")
async def revoke_editor(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/suspend-user/{user_id}")
async def suspend_user(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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

@router.post("/unsuspend-user/{user_id}")
async def unsuspend_user(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.get("/all-report")
async def get_all_report(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/resolve-report/{report_id}")
async def resolve_report(report_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.get("/get-user-by-comment/{comment_id}")
async def get_user_by_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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


@router.post("/reset-user-password/{user_id}")
async def reset_user_password(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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