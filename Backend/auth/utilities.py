from datetime import datetime, timedelta, UTC, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings


def create_token(data: dict):
    payload = data.copy() 
    expire_minutes = getattr(settings, "access_token_expire_minutes", 60)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    payload.update({"exp": expire})
    token = jwt.encode(
        payload,
        getattr(settings, "secret_key", ""),
        algorithm=getattr(settings, "algorithm", "HS256")
    )
    return token

 
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            getattr(settings, "secret_key", ""),
            algorithms=[getattr(settings, "algorithm", "HS256")]
        )
        return {
            "is_valid": True,
            "data": payload
        }
    except JWTError:
        return {
            "is_valid": False,
            "data": None
        }

def validate_admin_access(token: str):
    token_response = verify_token(token)
    if token_response["is_valid"]:
        user = token_response["data"]
        if user["role"] == "ADMIN":
            return {
                "has_access": True,
                "message": "User has ADMIN privileges",
                "id": user["id"]
            }
        else:
            return {
                "has_access": False,
                "message": "User does not have admin privileges"
            }
    else:
        return {
            "has_access": False,
            "message": "Invalid or expired token"
        }
    
def validate_user_access(token: str):
    token_response = verify_token(token)
    if token_response["is_valid"]:
        user = token_response["data"]
        if user["role"] == "USER":
            return {
                "has_access": True,
                "id": user["id"],
                "message": "User has USER privileges"
            }
        else:
            return {
                "has_access": True,
                "id": user["id"],
                "message": f"User also has {user['role']} privileges"
            }
    else:
        return {
            "has_access": False,
            "message": "Invalid or expired token"
        }
    
def validate_editor_access(token: str):
    token_response = verify_token(token)
    if token_response["is_valid"]:
        user = token_response["data"]
        if user["role"] == "EDITOR":
            return {
                "has_access": True,
                "id": user["id"],
                "message": "User has EDITOR privileges" # <-- Fixed typo here
            }
        else:
            if user["role"] == "ADMIN":
                return {
                    "has_access": True,
                    "id": user["id"],
                    "message": "User also has ADMIN privileges"
                }
            else:
                return {
                    "has_access": False,
                    "message": "User does not have EDITOR privileges"
                }
    else:
        return {
            "has_access": False,
            "message": "Invalid or expired token"
        }

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password( plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify( plain_password, hashed_password)
