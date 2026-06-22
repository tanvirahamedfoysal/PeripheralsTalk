from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from schemas.article import ArticleVersionPayload, RateArticlePayload, NewArticleVersionPayload, UpdateArticlePayload
from auth.utilities import validate_editor_access, validate_admin_access, validate_user_access
from db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter(prefix="/api/v1/article", tags=["article"])

# -------------------------
# GET ARTICLE (PUBLIC)
# -------------------------
@router.get("/{article_id}")
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("""
                SELECT 
                    a.id, a.peripheral_id, a.version_number, a.content, a.is_active, a.created_at,
                    u.username AS author_username,
                    i.url AS author_image_url,
                    COALESCE(r.avg_rating, 0) AS average_rating,
                    COALESCE(r.total_ratings, 0) AS total_ratings
                FROM peripheralstalk.articles a
                JOIN peripheralstalk.users u ON a.created_by = u.id
                LEFT JOIN peripheralstalk.images i ON u.image_id = i.id
                LEFT JOIN (
                    SELECT article_id,
                           ROUND(AVG(rating), 1) AS avg_rating,
                           COUNT(rating) AS total_ratings
                    FROM peripheralstalk.article_ratings
                    GROUP BY article_id
                ) r ON a.id = r.article_id
                WHERE a.id = :article_id
            """),
            {"article_id": article_id}
        )
        article = result.mappings().first()

        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        return {
            "is_successful": True,
            "message": "Article fetched successfully",
            "data": dict(article)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch article")


# -------------------------
# 1. CREATE NEW ARTICLE VERSION (POST)
# -------------------------
@router.post("/")
async def create_article_version(
    payload: NewArticleVersionPayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a brand new article version for a specific peripheral.
    Calculates the next version_number automatically.
    """
    access = validate_editor_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    editor_id = access["id"]

    # Verify the peripheral actually exists
    periph_check = await db.execute(
        text("""
                SELECT id 
                FROM peripheralstalk.peripherals 
                WHERE id = :peripheral_id
            """),
        {"peripheral_id": payload.peripheral_id}
    )
    if not periph_check.mappings().first():
        raise HTTPException(status_code=404, detail="Peripheral not found")

    try:
        # Step 1: Find the highest existing version_number for this specific peripheral
        version_check = await db.execute(
            text("""
                SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version 
                FROM peripheralstalk.articles 
                WHERE peripheral_id = :peripheral_id
            """),
            {"peripheral_id": payload.peripheral_id}
        )
        next_version = version_check.mappings().first()["next_version"]

        # Step 2: Insert the new version. is_active defaults to FALSE.
        result = await db.execute(
            text("""
                INSERT INTO peripheralstalk.articles 
                (peripheral_id, version_number, content, created_by, is_active)
                VALUES 
                (:peripheral_id, :version_number, :content, :editor_id, FALSE)
                RETURNING id, version_number
            """),
            {
                "peripheral_id": payload.peripheral_id,
                "version_number": next_version,
                "content": payload.content,
                "editor_id": int(editor_id)
            }
        )
        new_article = result.mappings().first()
        await db.commit()

        return {
            "is_successful": True,
            "message": "New article version created successfully",
            "data": {
                "article_id": new_article["id"],
                "version_number": new_article["version_number"],
                "peripheral_id": payload.peripheral_id
            }
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create new article version")


# -------------------------
# 2. UPDATE EXISTING ARTICLE IN-PLACE (PUT)
# -------------------------
@router.put("/{article_id}")
async def update_article_in_place(
    article_id: int, 
    payload: UpdateArticlePayload,
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the content of an existing article version without bumping the version number.
    """
    access = validate_editor_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    
    # Verify original article exists
    article_check = await db.execute(
        text("SELECT id FROM peripheralstalk.articles WHERE id = :article_id"),
        {"article_id": article_id}
    )
    if not article_check.mappings().first():
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        await db.execute(
            text("""
                UPDATE peripheralstalk.articles
                SET content = :content
                WHERE id = :article_id
            """),
            {
                "content": payload.content,
                "article_id": article_id
            }
        )
        await db.commit()

        return {
            "is_successful": True,
            "message": "Article content updated successfully"
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update article")

# -------------------------
# GET ALL ARTICLES BY PERIPHERAL (ADMIN)
# -------------------------
@router.get("/{peripheral_id}/all-articles")
async def get_all_articles(peripheral_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )

    try:
        result = await db.execute(
            text("""
                SELECT id, version_number, is_active, created_at, created_by
                FROM peripheralstalk.articles
                WHERE peripheral_id = :peripheral_id
                ORDER BY version_number DESC
            """),
            {"peripheral_id": peripheral_id}
        )
        articles = result.mappings().all()

        return {
            "is_successful": True,
            "message": "Articles fetched successfully",
            "data": [dict(a) for a in articles]
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch peripheral articles")


# -------------------------
# MAKE ARTICLE ACTIVE (ADMIN)
# -------------------------
@router.post("/{peripheral_id}/make-active/{article_id}")
async def make_article_active(
    peripheral_id: int, 
    article_id: int, 
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )

    # Verify article matching the peripheral constraint exists
    article_check = await db.execute(
        text("SELECT id, is_active FROM peripheralstalk.articles WHERE id = :article_id AND peripheral_id = :peripheral_id"),
        {"article_id": article_id, "peripheral_id": peripheral_id}
    )
    article = article_check.mappings().first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found for the specified peripheral")
    
    if article["is_active"]:
        raise HTTPException(status_code=400, detail="Article is already active")

    try:
        # Step 1: Deactivate all currently active articles for this peripheral
        await db.execute(
            text("""
                UPDATE peripheralstalk.articles 
                SET is_active = FALSE 
                WHERE peripheral_id = :peripheral_id AND is_active = TRUE
            """),
            {"peripheral_id": peripheral_id}
        )

        # Step 2: Activate the requested target article
        await db.execute(
            text("""
                UPDATE peripheralstalk.articles 
                SET is_active = TRUE 
                WHERE id = :article_id
            """),
            {"article_id": article_id}
        )
        
        await db.commit()

        return {
            "is_successful": True,
            "message": f"Article {article_id} is now the active article for this peripheral."
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to activate article")


# -------------------------
# DELETE ARTICLE (ADMIN - Hard Delete)
# -------------------------
@router.delete("/{article_id}")
async def delete_article(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_admin_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )

    article_check = await db.execute(
        text("SELECT id FROM peripheralstalk.articles WHERE id = :article_id"),
        {"article_id": article_id}
    )
    if not article_check.mappings().first():
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        # Note: Since there is no ON DELETE CASCADE in your schema, 
        # this will fail if the article has bookmarks, ratings, or comments.
        # You may need to delete those dependencies first depending on your constraints.
        await db.execute(
            text("DELETE FROM peripheralstalk.articles WHERE id = :article_id"),
            {"article_id": article_id}
        )
        await db.commit()

        return {
            "is_successful": True,
            "message": "Article permanently deleted"
        }
    except Exception as e:
        await db.rollback()
        # Typical FK constraint violation error
        raise HTTPException(status_code=400, detail="Cannot delete article because it is referenced by comments, bookmarks, or ratings.")


# -------------------------
# RATE ARTICLE (USER)
# -------------------------
@router.post("/{article_id}/rate")
async def rate_article(
    article_id: int, 
    payload: RateArticlePayload,
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

    # Verify article is present
    article_check = await db.execute(
        text("SELECT id FROM peripheralstalk.articles WHERE id = :article_id"),
        {"article_id": article_id}
    )
    if not article_check.first():
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        # Upsert rating
        await db.execute(
            text("""
                INSERT INTO peripheralstalk.article_ratings (article_id, user_id, rating)
                VALUES (:a_id, :u_id, :rating)
                ON CONFLICT (article_id, user_id)
                DO UPDATE SET rating = EXCLUDED.rating, created_at = now()
            """),
            {"a_id": article_id, "u_id": int(user_id), "rating": int(payload.rating)}
        )

        await db.commit()
        return {"is_successful": True, "message": f"Article rated {payload.rating} stars successfully"}
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit rating")


# -------------------------
# TOGGLE BOOKMARK (USER)
# -------------------------
@router.post("/{article_id}/toggle-bookmark")
async def toggle_bookmark(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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
        {"article_id": int(article_id)}
    )
    if not article_check.first():
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        bm_check = await db.execute(
            text("SELECT id FROM peripheralstalk.bookmarks WHERE article_id = :a_id AND user_id = :u_id"),
            {"a_id": int(article_id), "u_id": int(user_id)}
        )
        existing_bm = bm_check.mappings().first()

        if existing_bm:
            await db.execute(
                text("DELETE FROM peripheralstalk.bookmarks WHERE article_id = :a_id AND user_id = :u_id"),
                {"a_id": int(article_id), "u_id": int(user_id)}
            )
            message = "Removed from bookmarks"
            is_bookmarked = False
        else:
            await db.execute(
                text("INSERT INTO peripheralstalk.bookmarks (article_id, user_id) VALUES (:a_id, :u_id)"),
                {"a_id": int(article_id), "u_id": int(user_id)}
            )
            message = "Added to bookmarks"
            is_bookmarked = True

        await db.commit()
        return {
            "is_successful": True, 
            "message": message,
            "is_bookmarked": is_bookmarked
        }
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to toggle bookmark status")



# -------------------------------------
# Current Active Artilce for Peripheral
# -------------------------------------
@router.get("/active-article/{peripheral_id}")
async def current_active_article(
    peripheral_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """
        Open access API to get the current active
        article for a specific peripheral
    """
    try:
        response = await db.execute(
            text("""
                    SELECT id as article_id, content 
                    FROM peripheralstalk.articles 
                    WHERE peripheral_id = :p_id AND is_active = TRUE
                """),
            {"p_id": int(peripheral_id)}
        )
        content = response.mappings().first()

        if not content:
            return {
                "is_successful": False,
                "message": "No active article for this peripheral",
                "data": None
            }

        return {
            "is_successful": True,
            "message": "Article fetched successfully",
            "data": content
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Backend Server Failure")


# --------------------------------------------
# To check is this article liked by user(self)
# --------------------------------------------
@router.get("/{article_id}/is-rated")
async def check_is_rated(article_id: int, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    access = validate_user_access(token)
    if not access.get("has_access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token")
        )
    user_id = int(access["id"])

    try:
        # Check if a rating exists for this specific user and article
        result = await db.execute(
            text("""
                SELECT rating 
                FROM peripheralstalk.article_ratings 
                WHERE article_id = :article_id AND user_id = :user_id
            """),
            {"article_id": int(article_id), "user_id": int(user_id)}
        )
        
        user_rating = result.mappings().first()

        # If a record is found, return the rating details
        if user_rating:
            return {
                "is_successful": True,
                "message": "User rating retrieved successfully",
                "data": {
                    "is_rated": True,
                    "rating": user_rating["rating"]
                }
            }
        
        # If no record is found, the user hasn't rated it
        return {
            "is_successful": True,
            "message": "User has not rated this article",
            "data": {
                "is_rated": False,
                "rating": None
            }
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to check article rating status")