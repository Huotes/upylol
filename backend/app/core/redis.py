"""Redis connection pool for caching."""

import redis.asyncio as redis

from app.config import settings

pool: redis.Redis | None = None


async def init_redis() -> None:
    """Initialize Redis connection pool."""
    global pool  # noqa: PLW0603
    pool = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )


async def close_redis() -> None:
    """Close Redis connection pool."""
    if pool:
        await pool.aclose()


def get_redis() -> redis.Redis:
    """Return the Redis client (FastAPI dependency)."""
    if pool is None:
        msg = "Redis not initialized. Call init_redis() first."
        raise RuntimeError(msg)
    return pool
