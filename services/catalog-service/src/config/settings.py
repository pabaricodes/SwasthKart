import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = int(os.getenv("PORT", "3002"))
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5502/catalog_db",
    )
    log_level: str = os.getenv("LOG_LEVEL", "info")


settings = Settings()
