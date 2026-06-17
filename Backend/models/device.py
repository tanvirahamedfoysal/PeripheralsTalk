from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class Device(BaseModel):
    __tablename__ = "devices"

    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    owner = relationship("User", back_populates="devices")
