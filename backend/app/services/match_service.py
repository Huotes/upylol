"""Match history service — fetch and cache match data."""

import asyncio
import logging
from typing import Any

from app.config import settings
from app.riot.client import RiotClient
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)


class MatchService:
    """Fetch and cache match history from Riot API."""

    def __init__(self, riot: RiotClient, cache: CacheService) -> None:
        self._riot = riot
        self._cache = cache

    async def get_match_history(
        self,
        puuid: str,
        platform: str = "br1",
        count: int = 20,
        queue: int | None = 420,
    ) -> list[dict[str, Any]]:
        """Fetch recent matches with per-match caching."""
        match_ids = await self._riot.get_match_ids(
            puuid, platform, count=count, queue=queue,
        )

        tasks = [
            self._get_or_fetch_match(mid, platform) for mid in match_ids
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        matches: list[dict[str, Any]] = []
        for i, result in enumerate(results):
            if isinstance(result, BaseException):
                logger.warning(
                    "Failed to fetch match %s: %s",
                    match_ids[i],
                    result,
                )
                continue
            if isinstance(result, dict):
                matches.append(result)
        return matches

    async def _get_or_fetch_match(
        self,
        match_id: str,
        platform: str,
    ) -> dict[str, Any]:
        """Get match from cache or fetch from API."""
        cache_key = CacheService.key("match", match_id)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        match = await self._riot.get_match(match_id, platform)

        # Match data is immutable — cache for longer
        await self._cache.set(cache_key, match, ttl=settings.CACHE_TTL_MATCHES * 5)
        return match
