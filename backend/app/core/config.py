from pydantic_settings import BaseSettings
from pydantic import PostgresDsn
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    FRONTEND_URL: str
    BACKEND_API_URL: str
    DATABASE_URL: str

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
