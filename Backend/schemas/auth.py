from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str  
    email: EmailStr
    password: str

    image_url: str | None = None
    image_public_id: str | None = None
    
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ValidateTokenPayload(BaseModel):
    token: str
