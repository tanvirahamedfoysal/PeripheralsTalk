import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from auth.utilities import hash_password, validate_admin_access

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
    try:
        result = await db.execute(
            text("""
                SELECT 
                    ea.id AS application_id,
                    ea.note,
                    ea.status,
                    ea.created_at,
                    u.id AS user_id,
                    u.name,
                    u.username,
                    u.email
                FROM peripheralstalk.editor_applications ea
                JOIN peripheralstalk.users u ON ea.user_id = u.id
                ORDER BY 
                    CASE WHEN ea.status = 'PENDING' THEN 1 ELSE 2 END,
                    ea.created_at DESC
            """)
        )
        
        applications = result.mappings().all()

        return {
            "message": "Editor applications fetched successfully",
            "data": applications
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch editor applications"
        )


@router.post("/make-editor/{user_id}")
async def make_editor(
    user_id: int, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    admin_id = access["id"] # Fixed: Renamed to admin_id so it doesn't overwrite the path parameter

    # Check if the target user exists and what their current role is
    target_user_record = await db.execute(
        text("SELECT id, role FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    target_user = target_user_record.mappings().first()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if target_user["role"] == "EDITOR":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already an editor"
        )

    # Transaction begins implicitly here
    try:
        # 1. Update the user's role
        await db.execute(
            text("""
                UPDATE peripheralstalk.users 
                SET role = 'EDITOR' 
                WHERE id = :user_id
            """),
            {"user_id": user_id}
        )

        # 2. Automatically approve any pending editor applications for this user
        await db.execute(
            text("""
                UPDATE peripheralstalk.editor_applications
                SET status = 'APPROVED', reviewed_at = now()
                WHERE user_id = :user_id AND status = 'PENDING'
            """),
            {"user_id": user_id}
        )

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user to editor"
        )

    return {
        "is_successful": True,
        "message": f"User {user_id} has been successfully upgraded to EDITOR."
    }


@router.post("/revoke-editor/{user_id}")
async def revoke_editor(
    user_id: int, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    admin_id = access["id"] # Fixed: Renamed to admin_id to prevent overwriting path parameter

    # Check if the target user exists and what their current role is
    target_user_record = await db.execute(
        text("SELECT id, role FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    target_user = target_user_record.mappings().first()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if target_user["role"] != "EDITOR":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not currently an editor"
        )

    # Transaction begins implicitly here
    try:
        # Downgrade the user's role back to USER
        await db.execute(
            text("""
                UPDATE peripheralstalk.users 
                SET role = 'USER' 
                WHERE id = :user_id
            """),
            {"user_id": user_id}
        )

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke editor role"
        )

    return {
        "is_successful": True,
        "message": f"User {user_id}'s editor status has been successfully revoked."
    }


@router.post("/suspend-user/{user_id}")
async def suspend_user(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = access["id"]

    if admin_id == user_id:
        raise HTTPException(status_code=400, detail="You cannot suspend yourself")

    target_user_record = await db.execute(
        text("SELECT id, is_active FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    target_user = target_user_record.mappings().first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not target_user["is_active"]:
        raise HTTPException(status_code=400, detail="User is already suspended")

    try:
        await db.execute(
            text("UPDATE peripheralstalk.users SET is_active = FALSE WHERE id = :user_id"),
            {"user_id": user_id}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to suspend user")

    return {
        "is_successful": True,
        "message": f"User {user_id} has been suspended."
    }

# -------------------------
# UNSUSPEND USER
# -------------------------
@router.post("/unsuspend-user/{user_id}")
async def unsuspend_user(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = access["id"]

    target_user_record = await db.execute(
        text("SELECT id, is_active FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    target_user = target_user_record.mappings().first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user["is_active"]:
        raise HTTPException(status_code=400, detail="User is already active")

    try:
        await db.execute(
            text("UPDATE peripheralstalk.users SET is_active = TRUE WHERE id = :user_id"),
            {"user_id": user_id}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to unsuspend user")

    return {
        "is_successful": True,
        "message": f"User {user_id} has been reactivated."
    }

# -------------------------
# GET ALL REPORTS
# -------------------------
@router.get("/all-report")
async def get_all_report(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    try:
        result = await db.execute(
            text("""
                SELECT 
                    r.id AS report_id, r.note, r.status, r.created_at, r.reviewed_at,
                    r.reporter_id, u1.username AS reporter_username,
                    r.reported_user_id, u2.username AS reported_username,
                    r.comment_id, c.content AS comment_content,
                    r.reviewed_by, u3.username AS reviewer_username
                FROM peripheralstalk.reports r
                LEFT JOIN peripheralstalk.users u1 ON r.reporter_id = u1.id
                LEFT JOIN peripheralstalk.users u2 ON r.reported_user_id = u2.id
                LEFT JOIN peripheralstalk.users u3 ON r.reviewed_by = u3.id
                LEFT JOIN peripheralstalk.comments c ON r.comment_id = c.id
                ORDER BY 
                    CASE WHEN r.status = 'PENDING' THEN 1 ELSE 2 END,
                    r.created_at DESC
            """)
        )
        reports = result.mappings().all()
        
        return {
            "message": "Reports fetched successfully",
            "data": reports
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

# -------------------------
# RESOLVE REPORT
# -------------------------
@router.post("/resolve-report/{report_id}")
async def resolve_report(report_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    admin_id = int(access["id"])

    report_record = await db.execute(
        text("SELECT id, status FROM peripheralstalk.reports WHERE id = :report_id"),
        {"report_id": report_id}
    )
    report = report_record.mappings().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report["status"] == "RESOLVED":
        raise HTTPException(status_code=400, detail="Report is already resolved")

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.reports
                SET status = 'RESOLVED', reviewed_by = :admin_id, reviewed_at = now()
                WHERE id = :report_id
            """),
            {"admin_id": admin_id, "report_id": report_id}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to resolve report")

    return {
        "is_successful": True,
        "message": f"Report {report_id} has been marked as resolved."
    }

# -------------------------
# GET USER BY COMMENT
# -------------------------
@router.get("/get-user-by-comment/{comment_id}")
async def get_user_by_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    try:
        result = await db.execute(
            text("""
                SELECT 
                    u.id AS user_id, u.name, u.username, u.email, u.role, u.is_active,
                    c.id AS comment_id, c.content AS comment_content, c.is_deleted
                FROM peripheralstalk.comments c
                JOIN peripheralstalk.users u ON c.user_id = u.id
                WHERE c.id = :comment_id
            """),
            {"comment_id": comment_id}
        )
        user_data = result.mappings().first()
        
        if not user_data:
            raise HTTPException(status_code=404, detail="Comment or associated user not found")

        return {
            "message": "User fetched successfully",
            "data": user_data
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch user by comment")

# -------------------------
# RESET USER PASSWORD (ADMIN FORCED)
# -------------------------
@router.post("/reset-user-password/{user_id}")
async def reset_user_password(user_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )

    target_user_record = await db.execute(
        text("SELECT id FROM peripheralstalk.users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    if not target_user_record.mappings().first():
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a random 10-character password
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    new_password = ''.join(random.choices(characters, k=10))
    hashed_pwd = hash_password(new_password)

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.users 
                SET password = :password 
                WHERE id = :user_id
            """),
            {"password": hashed_pwd, "user_id": user_id}
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset user password")

    return {
        "is_successful": True,
        "message": "Password reset successfully.",
        "data": {
            "user_id": user_id,
            "new_password": new_password # Ensure admin securely relays this to the user
        }
    }