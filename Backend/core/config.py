from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import cloudinary

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
if not ENV_FILE.exists():
    ENV_FILE = BASE_DIR.parent / ".env"


class Settings(BaseSettings):
    api_title: str = "PeripheralsTalk API"
    api_version: str = "0.1.0"
    api_description: str = "FastAPI backend for PeripheralsTalk"

    database_url: str = "sqlite+aiosqlite:///./peripheralstalk.db"
    database_echo: bool = False
    secret_key: str = "CHANGE_ME_SECRET"
    internal_api_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    smtp_host: str = "smtp-relay.brevo.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    mail_from: str = "no-reply@example.com"

    debug: bool = True
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()

async def async_init_settings() -> Settings:
    """Async initializer for settings.

    Currently this validates and returns the same `settings` instance but
    provides a hook to perform async secret fetching or remote config
    bootstrapping in the future.
    """
    # Placeholder for async secret fetches (e.g., HashiCorp Vault, AWS SSM)
    # Example:
    # secrets = await fetch_remote_secrets()
    # if secrets.get("DATABASE_URL"): settings.database_url = secrets["DATABASE_URL"]

    # Re-validate settings (pydantic will perform validation on first access)
    return settings


cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)