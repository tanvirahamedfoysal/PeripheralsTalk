from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str  
    username: str
    email: EmailStr
    password: str
    image_url: str | None = None
    image_public_id: str | None = None
    
    
class UserLogin(BaseModel):
    username: str
    password: str


class ValidateTokenPayload(BaseModel):
    token: str


class RequestOTP(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class RegisterRequest(UserCreate):
    otp: str


