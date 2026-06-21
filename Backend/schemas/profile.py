from pydantic import BaseModel
from typing import Optional

class UpdateProfilePayload(BaseModel):
    name: str
    username: str
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None

class EditorApplicationPayload(BaseModel):
    note: Optional[str] = None

