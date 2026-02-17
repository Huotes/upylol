"""Centralized application settings via environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # App
    APP_NAME: str = "UPYLOL"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Riot API
    RIOT_API_KEY: str = ""
    RIOT_DEFAULT_REGION: str = "br1"

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://upylol:upylol@localhost:5432/upylol"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Cache TTLs (seconds)
    CACHE_TTL_PLAYER: int = 300
    CACHE_TTL_MATCHES: int = 120
    CACHE_TTL_ANALYSIS: int = 600
    CACHE_TTL_MASTERY: int = 900

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
