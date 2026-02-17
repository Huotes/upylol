"""Redis cache service with JSON serialization."""

import logging
from typing import Any

import orjson
import redis.asyncio as redis

logger = logging.getLogger(__name__)


class CacheService:
    """Thin wrapper over Redis for JSON caching."""

    def __init__(self, client: redis.Redis) -> None:
        self._redis = client

    async def get(self, key: str) -> Any | None:
        """Get a cached value, returning None on miss or error."""
        try:
            raw = await self._redis.get(key)
            if raw is None:
                return None
            return orjson.loads(raw)
        except Exception:
            logger.warning("Cache read failed for key=%s", key, exc_info=True)
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Cache a JSON-serializable value with TTL in seconds."""
        try:
            raw = orjson.dumps(value)
            await self._redis.setex(key, ttl, raw)
        except Exception:
            logger.warning("Cache write failed for key=%s", key, exc_info=True)

    async def delete(self, key: str) -> None:
        """Remove a cached key."""
        try:
            await self._redis.delete(key)
        except Exception:
            logger.warning("Cache delete failed for key=%s", key, exc_info=True)

    @staticmethod
    def key(prefix: str, *parts: str) -> str:
        """Build a namespaced cache key."""
        return f"upylol:{prefix}:{':'.join(parts)}"
