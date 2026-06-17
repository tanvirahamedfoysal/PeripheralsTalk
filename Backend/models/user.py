from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)

    devices = relationship("Device", back_populates="owner")
