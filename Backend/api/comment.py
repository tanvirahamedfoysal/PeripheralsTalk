from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from auth.utilities import validate_admin_access, validate_user_access
from schemas.comment import CommentPayload, ReportPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/comment", tags=["comment"])


# -------------------------
# CREATE TOP-LEVEL COMMENT
# -------------------------
@router.post("/{article_id}")
async def create_comment(
    article_id: int, 
    payload: CommentPayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    user_id = access["id"]

    # Verify article exists
    article_check = await db.execute(
        text("SELECT id FROM peripheralstalk.articles WHERE id = :article_id"),
        {"article_id": article_id}
    )
    if not article_check.first():
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.comments (article_id, user_id, content)
                VALUES (:article_id, :user_id, :content)
                RETURNING id, content, created_at
            """),
            {"article_id": int(article_id), "user_id": int(user_id), "content": payload.content}
        )
        new_comment = result.mappings().first()
        await db.commit()

        return {
            "is_successful": True,
            "message": "Comment added successfully",
            "data": new_comment
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add comment")


# -------------------------
# GET COMMENTS FOR AN ARTICLE
# -------------------------
@router.get("/{article_id}")
async def get_comments(article_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("""
                SELECT 
                    c.id as comment_id, c.parent_comment_id, c.content, c.created_at, c.updated_at, c.is_deleted,
                    u.id AS author_id, u.username AS author_username, u.name AS author_name,
                    COALESCE(v.upvotes, 0) AS upvotes,
                    COALESCE(v.downvotes, 0) AS downvotes
                FROM peripheralstalk.comments c
                JOIN peripheralstalk.users u ON c.user_id = u.id
                LEFT JOIN (
                    SELECT comment_id,
                           COUNT(CASE WHEN vote_type = 'UPVOTE' THEN 1 END) AS upvotes,
                           COUNT(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 END) AS downvotes
                    FROM peripheralstalk.comment_votes
                    GROUP BY comment_id
                ) v ON c.id = v.comment_id
                WHERE c.article_id = :article_id
                ORDER BY c.created_at ASC
            """),
            {"article_id": article_id}
        )
        comments = result.mappings().all()

        # Obfuscate content if deleted but preserve the structure for UI trees
        sanitized_comments = []
        for row in comments:
            comment_dict = dict(row)
            if comment_dict["is_deleted"]:
                comment_dict["content"] = "[This comment has been deleted]"
            sanitized_comments.append(comment_dict)

        return {
            "message": "Comments fetched successfully",
            "data": sanitized_comments
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch comments")


# -------------------------
# CREATE NESTED COMMENT
# -------------------------
@router.post("/reply/{comment_id}")
async def create_nested_comment(
    comment_id: int, 
    payload: CommentPayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    user_id = access["id"]

    # Verify parent comment exists and get its article_id
    parent_check = await db.execute(
        text("SELECT id, article_id FROM peripheralstalk.comments WHERE id = :comment_id AND is_deleted = FALSE"),
        {"comment_id": comment_id}
    )
    parent_comment = parent_check.mappings().first()

    if not parent_comment:
        raise HTTPException(status_code=404, detail="Parent comment not found or has been deleted")

    try:
        result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.comments (article_id, user_id, parent_comment_id, content)
                VALUES (:article_id, :user_id, :parent_id, :content)
                RETURNING id, parent_comment_id, content, created_at
            """),
            {
                "article_id": int(parent_comment["article_id"]), 
                "user_id": int(user_id), 
                "parent_id": int(comment_id),
                "content": payload.content
            }
        )
        nested_comment = result.mappings().first()
        await db.commit()

        return {
            "is_successful": True,
            "message": "Reply added successfully",
            "data": nested_comment
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add reply")


# -------------------------
# DELETE COMMENT
# -------------------------
@router.delete("/{comment_id}")
async def delete_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    user_id = access["id"]
    user_role = access.get("role", "USER")

    # Check ownership or if user is an ADMIN
    comment_check = await db.execute(
        text("SELECT id, user_id, is_deleted FROM peripheralstalk.comments WHERE id = :comment_id"),
        {"comment_id": comment_id}
    )
    comment = comment_check.mappings().first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment["is_deleted"]:
        raise HTTPException(status_code=400, detail="Comment is already deleted")

    if comment["user_id"] != user_id and user_role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this comment")

    try:
        await db.execute(
            text("UPDATE peripheralstalk.comments SET is_deleted = TRUE WHERE id = :comment_id"),
            {"comment_id": comment_id}
        )
        await db.commit()
        
        return {"is_successful": True, "message": "Comment deleted successfully"}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete comment")


# -------------------------
# UPDATE COMMENT
# -------------------------
@router.put("/{comment_id}")
async def update_comment(
    comment_id: int, 
    payload: CommentPayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    user_id = access["id"]

    comment_check = await db.execute(
        text("SELECT id, user_id, is_deleted FROM peripheralstalk.comments WHERE id = :comment_id"),
        {"comment_id": comment_id}
    )
    comment = comment_check.mappings().first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment["is_deleted"]:
        raise HTTPException(status_code=400, detail="Cannot edit a deleted comment")

    if comment["user_id"] != int(user_id):
        raise HTTPException(status_code=403, detail="You can only edit your own comments")

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.comments 
                SET content = :content, updated_at = now() 
                WHERE id = :comment_id
            """),
            {"content": payload.content, "comment_id": comment_id}
        )
        await db.commit()
        
        return {"is_successful": True, "message": "Comment updated successfully"}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update comment")


# -------------------------
# UPVOTE COMMENT
# -------------------------
@router.post("/{comment_id}/up-vote")
async def up_vote_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = int(access["id"])

    try:
        vote_check = await db.execute(
            text("SELECT vote_type FROM peripheralstalk.comment_votes WHERE comment_id = :c_id AND user_id = :u_id"),
            {"c_id": comment_id, "u_id": user_id}
        )
        existing_vote = vote_check.mappings().first()

        if existing_vote and existing_vote["vote_type"] == "UPVOTE":
            # If already upvoted, remove the vote (toggle behavior)
            await db.execute(
                text("DELETE FROM peripheralstalk.comment_votes WHERE comment_id = :c_id AND user_id = :u_id"),
                {"c_id": comment_id, "u_id": user_id}
            )
            message = "Upvote removed"
        else:
            # Insert or update to UPVOTE
            await db.execute(
                text("""
                    INSERT INTO peripheralstalk.comment_votes (comment_id, user_id, vote_type)
                    VALUES (:c_id, :u_id, 'UPVOTE')
                    ON CONFLICT (comment_id, user_id) 
                    DO UPDATE SET vote_type = EXCLUDED.vote_type, created_at = now()
                """),
                {"c_id": comment_id, "u_id": user_id}
            )
            message = "Comment upvoted"

        await db.commit()
        return {"is_successful": True, "message": message}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process upvote")


# -------------------------
# DOWNVOTE COMMENT
# -------------------------
@router.post("/{comment_id}/down-vote")
async def down_vote_comment(comment_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    user_id = int(access["id"])

    try:
        vote_check = await db.execute(
            text("SELECT vote_type FROM peripheralstalk.comment_votes WHERE comment_id = :c_id AND user_id = :u_id"),
            {"c_id": comment_id, "u_id": user_id}
        )
        existing_vote = vote_check.mappings().first()

        if existing_vote and existing_vote["vote_type"] == "DOWNVOTE":
            # If already downvoted, remove the vote
            await db.execute(
                text("DELETE FROM peripheralstalk.comment_votes WHERE comment_id = :c_id AND user_id = :u_id"),
                {"c_id": comment_id, "u_id": user_id}
            )
            message = "Downvote removed"
        else:
            # Insert or update to DOWNVOTE
            await db.execute(
                text("""
                    INSERT INTO peripheralstalk.comment_votes (comment_id, user_id, vote_type)
                    VALUES (:c_id, :u_id, 'DOWNVOTE')
                    ON CONFLICT (comment_id, user_id) 
                    DO UPDATE SET vote_type = EXCLUDED.vote_type, created_at = now()
                """),
                {"c_id": comment_id, "u_id": user_id}
            )
            message = "Comment downvoted"

        await db.commit()
        return {"is_successful": True, "message": message}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process downvote")


# -------------------------
# REPORT COMMENT
# -------------------------
@router.post("/{comment_id}/report")
async def report_comment(
    comment_id: int, 
    payload: ReportPayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
        
    reporter_id = int(access["id"])

    comment_check = await db.execute(
        text("SELECT id, user_id FROM peripheralstalk.comments WHERE id = :comment_id"),
        {"comment_id": comment_id}
    )
    comment = comment_check.mappings().first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    reported_user_id = comment["user_id"]

    if reporter_id == reported_user_id:
        raise HTTPException(status_code=400, detail="You cannot report your own comment")

    try:
        await db.execute(
            text("""
                INSERT INTO peripheralstalk.reports (reporter_id, reported_user_id, comment_id, note)
                VALUES (:reporter, :reported, :comment_id, :note)
            """),
            {
                "reporter": reporter_id, 
                "reported": reported_user_id, 
                "comment_id": comment_id, 
                "note": payload.note
            }
        )
        await db.commit()
        return {"is_successful": True, "message": "Report submitted successfully"}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit report")
    

# --------------------------------------------
# To check if a comment is voted by user(self)
# --------------------------------------------
@router.get("/is-voted/{comment_id}")
async def check_is_voted(
    comment_id: int, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = int(access["id"])

    try:
        # Check if a vote exists for this specific user and comment
        result = await db.execute(
            text("""
                SELECT vote_type 
                FROM peripheralstalk.comment_votes 
                WHERE comment_id = :comment_id AND user_id = :user_id
            """),
            {"comment_id": comment_id, "user_id": user_id}
        )
        
        user_vote = result.mappings().first()

        # If a record is found, return the vote details
        if user_vote:
            return {
                "is_successful": True,
                "message": "User vote retrieved successfully",
                "data": {
                    "is_voted": True,
                    "vote_type": user_vote["vote_type"]  # Will return 'UPVOTE' or 'DOWNVOTE'
                }
            }
        
        # If no record is found, the user hasn't voted
        return {
            "is_successful": True,
            "message": "User has not voted on this comment",
            "data": {
                "is_voted": False,
                "vote_type": None
            }
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to check comment vote status")


