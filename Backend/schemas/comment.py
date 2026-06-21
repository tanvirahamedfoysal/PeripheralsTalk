from pydantic import BaseModel

class CommentPayload(BaseModel):
    content: str

class ReportPayload(BaseModel):
    note: str