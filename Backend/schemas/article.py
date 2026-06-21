from pydantic import BaseModel, Field
from typing import Optional, Literal

class NewArticleVersionPayload(BaseModel):
    peripheral_id: int
    content: str

class UpdateArticlePayload(BaseModel):
    content: str

class ArticleVersionPayload(BaseModel):
    content: str

class RateArticlePayload(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating must be between 1 and 5")