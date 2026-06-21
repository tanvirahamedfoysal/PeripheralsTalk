from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer

from schemas.profile import UpdateProfilePayload, EditorApplicationPayload
from auth.utilities import validate_user_access, validate_admin_access
from db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

# -------------------------
# GET PROFILE PHOTO
# -------------------------
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
    if not image or not image["url"]:
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


# -------------------------
# VALIDATE USERNAME
# -------------------------
@router.post("/validate-username")
async def check_username_validity(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id FROM peripheralstalk.users WHERE username = :username"),
        {"username": username}
    )
    user = result.mappings().first()
    
    if user:
        return {"is_valid": False, "message": "Username is already taken"}
        
    return {"is_valid": True, "message": "Username is available"}


# -------------------------
# GET ALL USERS (ADMIN)
# -------------------------
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
                SELECT u.id, u.name, u.username, u.email, u.role, u.is_active, i.url AS image_url
                FROM peripheralstalk.users u 
                LEFT JOIN peripheralstalk.images i ON u.image_id = i.id
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


# -------------------------
# GET PROFILE (ME)
# -------------------------
@router.get("/me")
async def get_profile(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    
    result = await db.execute(
        text("""
            SELECT u.id, u.name, u.username, u.email, u.role, u.is_active,
                   i.id AS image_id, i.url AS image_url, i.public_id AS image_public_id
            FROM peripheralstalk.users u
            LEFT JOIN peripheralstalk.images i ON u.image_id = i.id
            WHERE u.id = :user_id
        """),
        {"user_id": int(user_id)}
    )
    user = result.mappings().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "is_successful": True,
        "message": "Profile fetched successfully",
        "data": user
    }


# -------------------------
# UPDATE PROFILE (ME)
# -------------------------
@router.put("/me")
async def update_profile(
    payload: UpdateProfilePayload, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]

    # Check if the desired username is taken by someone else
    username_check = await db.execute(
        text("SELECT id FROM peripheralstalk.users WHERE username = :username AND id != :user_id"),
        {"username": payload.username, "user_id": int(user_id)}
    )
    if username_check.mappings().first():
        raise HTTPException(status_code=400, detail="Username is already taken")

    try:
        # Update user details
        await db.execute(
            text("""
                UPDATE peripheralstalk.users 
                SET name = :name, username = :username 
                WHERE id = :user_id
            """),
            {"name": payload.name, "username": payload.username, "user_id": int(user_id)}
        )

        # Handle optional image update
        if payload.image_url and payload.image_public_id:
            user_image_check = await db.execute(
                text("SELECT image_id FROM peripheralstalk.users WHERE id = :user_id"),
                {"user_id": int(user_id)}
            )
            current_image = user_image_check.mappings().first()

            if current_image and current_image["image_id"]:
                # Update existing image record
                await db.execute(
                    text("UPDATE peripheralstalk.images SET url = :url, public_id = :pub WHERE id = :img_id"),
                    {"url": payload.image_url, "pub": payload.image_public_id, "img_id": int(current_image["image_id"])}
                )
            else:
                # Insert new image record and link to user
                new_image_res = await db.execute(
                    text("INSERT INTO peripheralstalk.images (url, public_id) VALUES (:url, :pub) RETURNING id"),
                    {"url": payload.image_url, "pub": payload.image_public_id}
                )
                new_image_id = new_image_res.mappings().first()["id"]
                await db.execute(
                    text("UPDATE peripheralstalk.users SET image_id = :img_id WHERE id = :user_id"),
                    {"img_id": new_image_id, "user_id": int(user_id)}
                )

        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

    return {
        "is_successful": True,
        "message": "Profile updated successfully"
    }


# -------------------------
# DELETE PROFILE (ME - Soft Delete)
# -------------------------
@router.delete("/me")
async def delete_profile(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]
    """
        Didn't check
    """
    
    try:
        # Soft delete by marking the user as inactive
        await db.execute(
            text("DELETE FROM peripheralstalk.users WHERE id = :user_id"),
            {"user_id": int(user_id)}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to deactivate account")

    return {
        "is_successful": True,
        "message": "Account deactivated successfully"
    }


# -------------------------
# REQUEST EDITOR ACCESS
# -------------------------
@router.post("/request-for-editor-access")
async def request_for_editor_access(
    payload: EditorApplicationPayload, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = access["id"]

    # Check user role
    role_check = await db.execute(
        text("SELECT role FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": int(user_id)}
    )
    user = role_check.mappings().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user["role"] in ["EDITOR", "ADMIN"]:
        raise HTTPException(status_code=400, detail="You already have editor or admin privileges")

    # Check for existing pending application
    app_check = await db.execute(
        text("SELECT id FROM peripheralstalk.editor_applications WHERE user_id = :user_id AND status = 'PENDING'"),
        {"user_id": int(user_id)}
    )
    if app_check.mappings().first():
        raise HTTPException(status_code=400, detail="You already have a pending application")

    try:
        await db.execute(
            text("""
                INSERT INTO peripheralstalk.editor_applications (user_id, note)
                VALUES (:user_id, :note)
            """),
            {"user_id": int(user_id), "note": payload.note}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit application")

    return {
        "is_successful": True,
        "message": "Editor application submitted successfully and is pending review"
    }