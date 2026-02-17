"""Async HTTP client for Riot Games API.

Handles rate limiting, retries on 429/5xx, and continental routing.
Uses PUUID-based endpoints as recommended by Riot (post Riot ID migration).

References:
    - https://developer.riotgames.com/apis
    - https://developer.riotgames.com/docs/portal
"""

import asyncio
import logging
from typing import Any

import httpx

from app.config import settings
from app.core.exceptions import RiotAPIError
from app.riot.constants import PLATFORM_TO_REGION
from app.riot.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_BACKOFF = 1.0  # seconds, multiplied by attempt number


class RiotClient:
    """Async client for Riot Games API with built-in rate limiting."""

    def __init__(self) -> None:
        self._http = httpx.AsyncClient(
            timeout=httpx.Timeout(15.0),
            headers={"X-Riot-Token": settings.RIOT_API_KEY},
        )
        self._limiter = RateLimiter()

    async def close(self) -> None:
        """Shut down the HTTP client."""
        await self._http.aclose()

    # -- Internal request machinery --

    async def _request(
        self,
        base_url: str,
        path: str,
        region_key: str,
        params: dict[str, Any] | None = None,
    ) -> Any:
        """Execute a rate-limited request with retry logic."""
        url = f"{base_url}{path}"

        for attempt in range(1, MAX_RETRIES + 1):
            await self._limiter.acquire(region_key)

            response = await self._http.get(url, params=params)

            # Dynamically update limits from response headers
            if app_limit := response.headers.get("X-App-Rate-Limit"):
                self._limiter.update_limits(region_key, app_limit)

            if response.status_code == 200:
                return response.json()

            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 5))
                logger.warning(
                    "Rate limited on %s, retrying in %ds (attempt %d/%d)",
                    path, retry_after, attempt, MAX_RETRIES,
                )
                await asyncio.sleep(retry_after)
                continue

            if response.status_code >= 500 and attempt < MAX_RETRIES:
                wait = RETRY_BACKOFF * attempt
                logger.warning(
                    "Riot API %d on %s, retrying in %.1fs (attempt %d/%d)",
                    response.status_code, path, wait, attempt, MAX_RETRIES,
                )
                await asyncio.sleep(wait)
                continue

            raise RiotAPIError(response.status_code, response.text)

        raise RiotAPIError(503, "Max retries exceeded")

    def _platform_url(self, platform: str) -> str:
        return f"https://{platform}.api.riotgames.com"

    def _region_url(self, platform: str) -> str:
        region = PLATFORM_TO_REGION.get(platform, "americas")
        return f"https://{region}.api.riotgames.com"

    def _routing_region(self, platform: str) -> str:
        return PLATFORM_TO_REGION.get(platform, "americas")

    # -- Account V1 (continental routing) --

    async def get_account_by_riot_id(
        self,
        game_name: str,
        tag_line: str,
        platform: str = "br1",
    ) -> dict[str, Any]:
        """Resolve Riot ID (gameName#tagLine) → PUUID."""
        return await self._request(
            self._region_url(platform),
            f"/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}",
            self._routing_region(platform),
        )

    # -- Summoner V4 (platform routing) --

    async def get_summoner_by_puuid(
        self,
        puuid: str,
        platform: str = "br1",
    ) -> dict[str, Any]:
        """Get summoner data by PUUID."""
        return await self._request(
            self._platform_url(platform),
            f"/lol/summoner/v4/summoners/by-puuid/{puuid}",
            platform,
        )

    # -- League V4 (platform routing) --

    async def get_league_entries(
        self,
        summoner_id: str,
        platform: str = "br1",
    ) -> list[dict[str, Any]]:
        """Get ranked league entries for a summoner."""
        return await self._request(
            self._platform_url(platform),
            f"/lol/league/v4/entries/by-summoner/{summoner_id}",
            platform,
        )

    # -- Match V5 (continental routing) --

    async def get_match_ids(
        self,
        puuid: str,
        platform: str = "br1",
        count: int = 20,
        queue: int | None = 420,
        start: int = 0,
        start_time: int | None = None,
    ) -> list[str]:
        """Fetch recent match IDs for a player."""
        params: dict[str, Any] = {"count": count, "start": start}
        if queue is not None:
            params["queue"] = queue
        if start_time is not None:
            params["startTime"] = start_time

        return await self._request(
            self._region_url(platform),
            f"/lol/match/v5/matches/by-puuid/{puuid}/ids",
            self._routing_region(platform),
            params=params,
        )

    async def get_match(
        self,
        match_id: str,
        platform: str = "br1",
    ) -> dict[str, Any]:
        """Get full match data by match ID."""
        return await self._request(
            self._region_url(platform),
            f"/lol/match/v5/matches/{match_id}",
            self._routing_region(platform),
        )

    # -- Champion Mastery V4 (platform routing) --

    async def get_champion_mastery_top(
        self,
        puuid: str,
        platform: str = "br1",
        count: int = 10,
    ) -> list[dict[str, Any]]:
        """Get top champion masteries by PUUID."""
        return await self._request(
            self._platform_url(platform),
            f"/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top",
            platform,
            params={"count": count},
        )

    # -- Spectator V5 (platform routing) --

    async def get_active_game(
        self,
        puuid: str,
        platform: str = "br1",
    ) -> dict[str, Any] | None:
        """Get live game data. Returns None if not in game."""
        try:
            return await self._request(
                self._platform_url(platform),
                f"/lol/spectator/v5/active-games/by-summoner/{puuid}",
                platform,
            )
        except RiotAPIError as err:
            if err.status_code == 404:
                return None
            raise
