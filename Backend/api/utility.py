from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/utility", tags=["utility"])


# @router.get("/auth-status")
# async def auth_status():
#     """Authentication status endpoint"""
#     return {
#         "authenticated": False,
#         "message": "Authentication is not configured yet.",
#     }

@router.post("/upload-image")
async def upload_image():
    return {
        "message": "Not implemented yet"
    }

