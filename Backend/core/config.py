from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
if not ENV_FILE.exists():
    ENV_FILE = BASE_DIR.parent / ".env"


class Settings(BaseSettings):
    api_title: str
    api_version: str
    api_description: str

    database_url: str
    database_url: str
    database_echo: bool = False
    secret_key: str
    internal_api_key: str
    algorithm: str
    access_token_expire_minutes: int

    debug: bool
    environment: str

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
