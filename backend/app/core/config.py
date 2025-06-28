import secrets
from typing import Annotated, Any
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, AnyUrl, BeforeValidator
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = [
        "http://localhost:3000",
    ]
    BACKEND_URL: str = "http://localhost:8000"

    # GCP Configuration
    GCP_PROJECT_ID: str = "attensys-dev"
    GCP_BUCKET_NAME: str = "test_recorded_video"
    GCP_SERVICE_ACCOUNT_KEY_PATH: str = "attensys-dev.json"
    GCP_SIGNED_URL_EXPIRATION: int = 3600  # 1 hour in seconds

    @property
    def POSTGRES_DATABASE_URL(self) -> PostgresDsn:
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
