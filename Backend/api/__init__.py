from fastapi import APIRouter
from .admin import router as admin_router
from .article import router as article_router
from .auth import router as authentication_router
from .category import router as category_router
from .comment import router as comment_router
from .profile import router as profile_router
from .utility import router as utility_router
 
router = APIRouter()
router.include_router(admin_router)
router.include_router(article_router)
router.include_router(authentication_router)
router.include_router(category_router)
router.include_router(comment_router)
router.include_router(profile_router)
router.include_router(utility_router)

__all__ = [
    "router",
    "admin_router", 
    "article_router",
    "authentication_router",
    "category_router",
    "comment_router",
    "profile_router",
    "utility_router"
]
