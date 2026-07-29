from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "InclusiveCart AI"
    app_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "postgresql://postgres:postgres@localhost:5432/inclusivecart"
    database_echo: bool = False

    jwt_secret_key: str = "change-this-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    reset_token_expire_minutes: int = 60

    groq_api_key: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
