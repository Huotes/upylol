"""FastAPI dependency injection providers."""

from collections.abc import AsyncGenerator
from functools import lru_cache

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.redis import get_redis
from app.riot.client import RiotClient
from app.services.cache_service import CacheService


async def get_db() -> AsyncGenerator[AsyncSession]:
    """Database session dependency."""
    async for session in get_session():
        yield session


@lru_cache(maxsize=1)
def get_riot_client() -> RiotClient:
    """Singleton Riot API client."""
    return RiotClient()


def get_cache_service() -> CacheService:
    """Cache service dependency."""
    return CacheService(get_redis())
