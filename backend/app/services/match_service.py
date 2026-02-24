"""Match history service — fetch and cache match data.

Optimized with:
- Semaphore to limit concurrent API calls (avoid rate limiting)
- Per-match Redis caching (matches are immutable, cache forever-ish)
- Parallel fetch with controlled concurrency
"""

import asyncio
import logging
from typing import Any

from app.config import settings
from app.riot.client import RiotClient
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)

# Limit concurrent match fetches to avoid Riot API rate limits
_MATCH_FETCH_SEMAPHORE = asyncio.Semaphore(5)


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
        """Fetch recent matches with per-match caching and controlled concurrency."""
        # Check if full result is cached
        history_key = CacheService.key("history", puuid, str(count), str(queue or 0))
        cached_history = await self._cache.get(history_key)
        if cached_history:
            return cached_history

        match_ids = await self._riot.get_match_ids(
            puuid, platform, count=count, queue=queue,
        )

        if not match_ids:
            return []

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

        # Cache assembled history for a short TTL (new matches may come in)
        if matches:
            await self._cache.set(history_key, matches, settings.CACHE_TTL_MATCHES)

        return matches

    async def _get_or_fetch_match(
        self,
        match_id: str,
        platform: str,
    ) -> dict[str, Any]:
        """Get match from cache or fetch from API with concurrency control."""
        cache_key = CacheService.key("match", match_id)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        async with _MATCH_FETCH_SEMAPHORE:
            # Double-check cache after acquiring semaphore
            cached = await self._cache.get(cache_key)
            if cached:
                return cached

            match = await self._riot.get_match(match_id, platform)

            # Match data is immutable — cache for 24h
            await self._cache.set(cache_key, match, ttl=86400)
            return match
