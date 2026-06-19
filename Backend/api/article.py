from fastapi import APIRouter
from Backend.auth.utilities import validate_editor_access, validate_user_access

router = APIRouter(prefix="/api/v1/article", tags=["article"])


@router.get("/{article_id}")
async def get_article(article_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/{article_id}")
async def update_article(article_id: int):
    # create a new article for the id
    return {
        "message": "Not implemented yet"
    }

@router.get("/{category_id}/all-articles")
async def get_all_articles(category_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/{category_id}/make-active/{article_id}")
async def make_article_active(category_id: int, article_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.delete("/{article_id}")
async def delete_article(article_id: int):
    return {
        "message": "Not implemented yet"
    }   

@router.post("/{article_id}/vote")
async def vote_article(article_id: int):
    # 1 - 5 star rating for an article
    return {
        "message": "Not implemented yet"
    }

@router.post("/toggle_favourite/{article_id}")
async def toggle_favourite(article_id: int):
    return {
        "message": "Not implemented yet"
    }