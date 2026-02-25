"""Match history service — fetch and cache match data.

Optimized with:
- Semaphore to limit concurrent API calls (avoid rate limiting)
- Per-match Redis caching (matches are immutable, cache forever-ish)
- Parallel fetch with controlled concurrency
- Match detail with timeline analysis
"""

import asyncio
import logging
from typing import Any

from app.analysis.match_analyzer import MatchDetailAnalyzer
from app.config import settings
from app.riot.client import RiotClient
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)

# Limit concurrent match fetches to avoid Riot API rate limits
_MATCH_FETCH_SEMAPHORE = asyncio.Semaphore(5)
# Timelines are heavier, lower concurrency limit
_TIMELINE_FETCH_SEMAPHORE = asyncio.Semaphore(3)


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
        start_time: int | None = None,
        end_time: int | None = None,
    ) -> list[dict[str, Any]]:
        """Fetch matches with per-match caching and controlled concurrency.

        When start_time/end_time are provided, paginates to fetch ALL matches
        in that range (capped at 500). Otherwise fetches `count` recent.
        """
        time_suffix = f"{start_time or 0}_{end_time or 0}"
        history_key = CacheService.key(
            "history", puuid, str(count), str(queue or 0), time_suffix,
        )
        cached_history = await self._cache.get(history_key)
        if cached_history:
            return cached_history

        match_ids = await self._get_all_match_ids(
            puuid, platform, count, queue, start_time, end_time,
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

        if matches:
            await self._cache.set(history_key, matches, settings.CACHE_TTL_MATCHES)

        return matches

    async def _get_all_match_ids(
        self,
        puuid: str,
        platform: str,
        count: int,
        queue: int | None,
        start_time: int | None,
        end_time: int | None,
    ) -> list[str]:
        """Fetch match IDs with pagination for time-range queries.

        Without time range: single request with `count`.
        With time range: paginate in batches of 100 until exhausted (cap 500).
        """
        if start_time is None and end_time is None:
            return await self._riot.get_match_ids(
                puuid, platform, count=count, queue=queue,
            )

        all_ids: list[str] = []
        batch_size = 100
        max_total = 500
        offset = 0

        while offset < max_total:
            batch = await self._riot.get_match_ids(
                puuid, platform,
                count=batch_size,
                queue=queue,
                start=offset,
                start_time=start_time,
                end_time=end_time,
            )
            if not batch:
                break
            all_ids.extend(batch)
            offset += len(batch)
            if len(batch) < batch_size:
                break

        return all_ids

    async def get_match_detail(
        self,
        match_id: str,
        puuid: str,
        platform: str = "br1",
        tier: str = "SILVER",
    ) -> dict[str, Any]:
        """Get enriched match detail with timeline analysis.

        Fetches match + timeline in parallel, then runs deep analysis.
        Result is cached per (match_id, puuid) since analysis is player-specific.
        """
        detail_key = CacheService.key("match_detail", match_id, puuid)
        cached = await self._cache.get(detail_key)
        if cached:
            return cached

        # Fetch match and timeline in parallel
        match_task = self._get_or_fetch_match(match_id, platform)
        timeline_task = self._get_or_fetch_timeline(match_id, platform)

        match, timeline = await asyncio.gather(
            match_task, timeline_task, return_exceptions=True,
        )

        # Match is required, timeline is optional (graceful degradation)
        if isinstance(match, BaseException):
            raise match
        if isinstance(timeline, BaseException):
            logger.warning("Timeline unavailable for %s: %s", match_id, timeline)
            timeline = None

        # Run deep analysis
        analyzer = MatchDetailAnalyzer()
        analysis = analyzer.analyze(match, timeline, puuid, tier)

        result = {
            "match": match,
            "analysis": analysis,
        }

        # Cache for 24h (matches are immutable)
        await self._cache.set(detail_key, result, ttl=86400)
        return result

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

    async def _get_or_fetch_timeline(
        self,
        match_id: str,
        platform: str,
    ) -> dict[str, Any]:
        """Get timeline from cache or fetch from API."""
        cache_key = CacheService.key("timeline", match_id)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        async with _TIMELINE_FETCH_SEMAPHORE:
            cached = await self._cache.get(cache_key)
            if cached:
                return cached

            timeline = await self._riot.get_match_timeline(match_id, platform)
            await self._cache.set(cache_key, timeline, ttl=86400)
            return timeline
