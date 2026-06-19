from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth.utilities import validate_user_access

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

@router.get("/profile-photo")
async def get_profile_photo(token: str = Depends(oauth2_scheme)):
    if validate_user_access(token)["has_access"]:



        
        pass
    else:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

@router.get("/all")
async def get_all_users():
    return {
        "message": "Not implemented yet"
    }

@router.get("/me")
async def get_profile():
    return {
        "message": "Not implemented yet"
    }

@router.put("/me")
async def update_profile():
    return {
        "message": "Not implemented yet"
    }

@router.delete("/me")
async def delete_profile():
    return {
        "message": "Not implemented yet"
    }

@router.post("/request-for-editor-access")
async def request_for_editor_access():
    return {
        "message": "Not implemented yet"
    }
