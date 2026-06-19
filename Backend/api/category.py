from fastapi import APIRouter
from Backend.auth.utilities import validate_admin_access

router = APIRouter(prefix="/api/v1/category", tags=["category"])


@router.get("/")
async def get_categories():
    return {
        "message": "Not implemented yet"
    }

@router.get("/{id}")
async def get_category(id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/")
async def create_category():
    return {
        "message": "Not implemented yet"
    }

@router.put("/{id}")
async def update_category(id: int):
    return {
        "message": "Not implemented yet"
    }

@router.delete("/{id}")
async def delete_category(id: int):
    return {
        "message": "Not implemented yet"
    }
