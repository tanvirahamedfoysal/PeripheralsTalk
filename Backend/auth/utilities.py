from datetime import datetime, timedelta, UTC
from jose import JWTError, jwt
from passlib.context import CryptContext

from Backend.core.config import settings


def create_token(data: dict):
    payload = data.copy()
    expire = datetime.now(UTC) + timedelta(
        minutes=getattr(settings, "access_token_expire_minutes", None) or getattr(settings, "access_token_expire_minutes", 60)
    )
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


pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )
