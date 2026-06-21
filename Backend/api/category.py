from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db

from schemas.category import CategoryPayload
from auth.utilities import validate_admin_access

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/category", tags=["category"])

# -------------------------
# GET ALL CATEGORIES
# -------------------------
@router.get("/")
async def get_categories(db: AsyncSession = Depends(get_db)):
    try:
        # Fetches categories and an array of active article IDs associated with them
        result = await db.execute(
            text("""
                SELECT id, name
                FROM peripheralstalk.peripherals
            """)
        )
        categories = result.mappings().all()

        return {
            "is_successful": True,
            "message": "Categories fetched successfully",
            "data": categories
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch categories"
        )


# -------------------------
# GET SINGLE CATEGORY
# -------------------------
@router.get("/{id}")
async def get_category(id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("""
                SELECT 
                    p.id, p.name, a.content as article
                FROM
                    peripheralstalk.peripherals p JOIN peripheralstalk.articles a ON p.id = a.peripheral_id
                WHERE 
                    a.is_active = TRUE and
                    p.id = :id
            """),
            {"id": id}
        )
        category = result.mappings().first()

        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        return {
            "is_successful": True,
            "message": "Category fetched successfully",
            "data": category
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch category"
        )


# -------------------------
# CREATE CATEGORY (ADMIN)
# -------------------------
@router.post("/")
async def create_category(
    payload: CategoryPayload, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = access["id"]

    name_check = await db.execute(
        text("SELECT id FROM peripheralstalk.peripherals WHERE name = :name"),
        {"name": payload.name}
    )
    if name_check.mappings().first():
        raise HTTPException(status_code=400, detail="A category with this name already exists")

    try:
        result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.peripherals (name)
                VALUES (:name)
                RETURNING id, name, created_at
            """),
            {"name": payload.name}
        )
        new_category = result.mappings().first()
        await db.commit()

        return {
            "is_successful": True,
            "message": "Category created successfully",
            "data": new_category
        }
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category"
        )


# -------------------------
# UPDATE CATEGORY (ADMIN)
# -------------------------
@router.put("/{id}")
async def update_category(
    id: int, 
    payload: CategoryPayload, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = access["id"]

    # Verify category exists
    category_check = await db.execute(
        text("SELECT id FROM peripheralstalk.peripherals WHERE id = :id"),
        {"id": id}
    )
    if not category_check.mappings().first():
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if new name conflicts with another existing category
    name_check = await db.execute(
        text("SELECT id FROM peripheralstalk.peripherals WHERE name = :name AND id != :id"),
        {"name": payload.name, "id": id}
    )
    if name_check.mappings().first():
        raise HTTPException(status_code=400, detail="Another category with this name already exists")

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.peripherals
                SET 
                    name = :name
                WHERE id = :id
            """),
            {"name": payload.name, "id": id}
        )
        await db.commit()

        return {
            "is_successful": True,
            "message": "Category updated successfully"
        }
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update category"
        )


# -------------------------
# DELETE CATEGORY (ADMIN)
# -------------------------
@router.delete("/{id}")
async def delete_category(
    id: int, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = access["id"]

    # Verify category exists
    category_check = await db.execute(
        text("SELECT id FROM peripheralstalk.peripherals WHERE id = :id"),
        {"id": id}
    )
    if not category_check.mappings().first():
        raise HTTPException(status_code=404, detail="Category not found")

    # Prevent deletion if active articles are attached
    article_check = await db.execute(
        text("""
                SELECT id 
                FROM peripheralstalk.articles 
                WHERE peripheral_id = :id
            """),
        {"id": id}
    )
    if article_check.mappings().first():
        raise HTTPException(
            status_code=400, 
            detail="Failed to delete category."
        )

    try:
        await db.execute(
            text("DELETE FROM peripheralstalk.peripherals WHERE id = :id"),
            {"id": id}
        )
        await db.commit()

        return {
            "is_successful": True,
            "message": "Category deleted successfully"
        }
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete category"
        )