"""Base schemas for common response patterns"""

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    """Generic response wrapper"""

    success: bool = Field(default=True, description="Whether the request was successful")
    message: str = Field(default="Success", description="Response message")
    data: T = Field(default=None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

    class Config:
        """Pydantic config"""

        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Success",
                "data": None,
                "timestamp": "2024-01-01T00:00:00",
            }
        }
