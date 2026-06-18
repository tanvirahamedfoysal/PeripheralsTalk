from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

@router.get("/profile-photo")
async def get_profile_photo():
    # by JWT
    return {
        "message": "Not implemented yet"
    }

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
