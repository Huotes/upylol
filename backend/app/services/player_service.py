"""Player profile service — orchestrates Riot API calls into a profile."""

import logging
from typing import Any

from app.config import settings
from app.core.exceptions import AppError, PlayerNotFoundError, RiotAPIError
from app.riot.client import RiotClient
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)


class PlayerService:
    """Build complete player profiles from Riot API data."""

    def __init__(self, riot: RiotClient, cache: CacheService) -> None:
        self._riot = riot
        self._cache = cache

    async def get_profile(
        self,
        game_name: str,
        tag_line: str,
        platform: str = "br1",
    ) -> dict[str, Any]:
        """Fetch full player profile: account + summoner + ranked + mastery.

        Flow (all PUUID-based, post July 2025 migration):
            1. Account V1 (continental) → resolve Riot ID to PUUID
            2. Summoner V4 (platform)   → level, icon
            3. League V4 by PUUID       → ranked entries
            4. Champion Mastery V4      → top champions
        """
        cache_key = CacheService.key("player", platform, game_name, tag_line)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        # 1. Resolve Riot ID -> PUUID
        try:
            account = await self._riot.get_account_by_riot_id(
                game_name, tag_line, platform,
            )
        except RiotAPIError as err:
            if err.status_code == 404:
                raise PlayerNotFoundError(game_name, tag_line) from err
            raise

        puuid = account.get("puuid")
        if not puuid:
            logger.error("Account response missing puuid: %s", account)
            raise AppError("Invalid account data from Riot API", 502)

        # 2. Fetch summoner data (level, icon)
        summoner = await self._riot.get_summoner_by_puuid(puuid, platform)

        # 3. Fetch ranked entries directly by PUUID
        #    (summoner_id foi removido da resposta do Summoner V4 em Jul/2025)
        league_entries: list[dict[str, Any]] = []
        try:
            league_entries = await self._riot.get_league_entries(puuid, platform)
        except RiotAPIError:
            logger.warning(
                "Failed to fetch league entries for puuid=%s",
                puuid,
                exc_info=True,
            )

        # 4. Fetch champion mastery
        mastery: list[dict[str, Any]] = []
        try:
            mastery = await self._riot.get_champion_mastery_top(
                puuid, platform, count=10,
            )
        except RiotAPIError:
            logger.warning(
                "Failed to fetch mastery for puuid=%s", puuid, exc_info=True,
            )

        # 5. Extract ranked solo queue data
        ranked_solo = next(
            (e for e in league_entries if e.get("queueType") == "RANKED_SOLO_5x5"),
            None,
        )

        profile: dict[str, Any] = {
            "puuid": puuid,
            "game_name": account.get("gameName", game_name),
            "tag_line": account.get("tagLine", tag_line),
            "platform": platform,
            "summoner_level": summoner.get("summonerLevel", 0),
            "profile_icon_id": summoner.get("profileIconId", 0),
            "ranked": _format_ranked(ranked_solo),
            "top_mastery": mastery,
        }

        await self._cache.set(cache_key, profile, settings.CACHE_TTL_PLAYER)
        return profile


def _format_ranked(entry: dict[str, Any] | None) -> dict[str, Any]:
    """Format ranked data, returning unranked defaults if None."""
    if not entry:
        return {
            "tier": "UNRANKED",
            "rank": "",
            "lp": 0,
            "wins": 0,
            "losses": 0,
            "win_rate": 0.0,
            "hot_streak": False,
        }

    wins = entry.get("wins", 0)
    losses = entry.get("losses", 0)
    total = wins + losses

    return {
        "tier": entry.get("tier", "UNRANKED"),
        "rank": entry.get("rank", ""),
        "lp": entry.get("leaguePoints", 0),
        "wins": wins,
        "losses": losses,
        "win_rate": round(wins / total * 100, 1) if total else 0.0,
        "hot_streak": entry.get("hotStreak", False),
    }
