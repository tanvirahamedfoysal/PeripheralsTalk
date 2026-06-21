from pydantic import BaseModel
from typing import Optional

class CategoryPayload(BaseModel):
    name: str

