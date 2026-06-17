"""Base model with common fields"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class BaseModel(Base):
    """Base model with common fields for all models

    Uses timezone-aware `DateTime` columns and server-side timestamps via
    `func.now()` to avoid relying on naive `datetime.utcnow()` defaults.
    """

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
