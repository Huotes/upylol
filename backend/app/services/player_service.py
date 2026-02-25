"""Player profile service — orchestrates Riot API calls into a profile.

Optimized with asyncio.gather for parallel API calls where possible.
"""

import asyncio
import logging
from typing import Any

from app.analysis.stats_extractor import aggregate_stats, detect_primary_role, extract_match_stats
from app.config import settings
from app.core.exceptions import AppError, PlayerNotFoundError, RiotAPIError
from app.riot.client import RiotClient
from app.riot.seasons import get_available_seasons, get_season
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
        """Fetch full player profile with parallel API calls.

        Flow:
            1. Account V1 (continental) -> resolve Riot ID to PUUID
            2. In parallel:
               - Summoner V4 (platform) -> level, icon
               - League V4 by PUUID    -> ranked entries
               - Champion Mastery V4   -> top champions
        """
        cache_key = CacheService.key("player", platform, game_name, tag_line)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        # 1. Resolve Riot ID -> PUUID (must be first, others depend on it)
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

        # 2. Fetch summoner, ranked, and mastery IN PARALLEL
        summoner_task = self._riot.get_summoner_by_puuid(puuid, platform)
        league_task = self._safe_fetch(
            self._riot.get_league_entries(puuid, platform),
            default=[],
            label="league_entries",
        )
        mastery_task = self._safe_fetch(
            self._riot.get_champion_mastery_top(puuid, platform, count=10),
            default=[],
            label="mastery",
        )

        summoner, league_entries, mastery = await asyncio.gather(
            summoner_task, league_task, mastery_task,
        )

        # 3. Extract ranked solo queue data
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

    async def get_season_stats(
        self,
        puuid: str,
        platform: str = "br1",
        season_key: str = "current",
        queue: int = 420,
    ) -> dict[str, Any]:
        """Get wins/losses and primary role for a specific season.

        For "current", uses League V4 wins/losses + recent matches for role.
        For specific seasons, fetches matches in the date range.
        """
        cache_key = CacheService.key("season_stats", puuid, platform, season_key)
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        if season_key == "current":
            result = await self._current_season_stats(puuid, platform, queue)
        else:
            result = await self._historical_season_stats(
                puuid, platform, season_key, queue,
            )

        result["available_seasons"] = get_available_seasons()
        ttl = 300 if season_key == "current" else 3600  # 5min vs 1h
        await self._cache.set(cache_key, result, ttl)
        return result

    async def _current_season_stats(
        self,
        puuid: str,
        platform: str,
        queue: int,
    ) -> dict[str, Any]:
        """Current season: League V4 for W/L + recent matches for role."""
        league_entries = await self._safe_fetch(
            self._riot.get_league_entries(puuid, platform),
            default=[],
            label="league_entries",
        )

        ranked_solo = next(
            (e for e in league_entries if e.get("queueType") == "RANKED_SOLO_5x5"),
            None,
        )

        wins = ranked_solo.get("wins", 0) if ranked_solo else 0
        losses = ranked_solo.get("losses", 0) if ranked_solo else 0
        total = wins + losses

        # Fetch recent matches just for role detection
        match_ids = await self._safe_fetch(
            self._riot.get_match_ids(puuid, platform, count=20, queue=queue),
            default=[],
            label="match_ids_role",
        )

        primary_role = ""
        if match_ids:
            matches = await self._fetch_matches_batch(match_ids[:15], platform)
            stats_list = [
                extract_match_stats(m, puuid)
                for m in matches
                if extract_match_stats(m, puuid) is not None
            ]
            primary_role = detect_primary_role(
                [s for s in stats_list if s is not None]
            )

        return {
            "season": "current",
            "season_label": "Temporada Atual",
            "wins": wins,
            "losses": losses,
            "win_rate": round(wins / total * 100, 1) if total else 0.0,
            "games_played": total,
            "primary_role": primary_role,
        }

    async def _historical_season_stats(
        self,
        puuid: str,
        platform: str,
        season_key: str,
        queue: int,
    ) -> dict[str, Any]:
        """Historical season: fetch matches in date range, count W/L."""
        season = get_season(season_key)
        if not season:
            return {
                "season": season_key,
                "season_label": season_key,
                "wins": 0,
                "losses": 0,
                "win_rate": 0.0,
                "games_played": 0,
                "primary_role": "",
            }

        # Fetch match IDs within season time range (up to 100)
        all_match_ids: list[str] = []
        start = 0
        batch_size = 100

        match_ids = await self._safe_fetch(
            self._riot.get_match_ids(
                puuid, platform,
                count=batch_size,
                queue=queue,
                start=start,
                start_time=season.start_ts,
                end_time=season.end_ts,
            ),
            default=[],
            label="season_match_ids",
        )
        all_match_ids.extend(match_ids)

        if not all_match_ids:
            return {
                "season": season_key,
                "season_label": season.label,
                "wins": 0,
                "losses": 0,
                "win_rate": 0.0,
                "games_played": 0,
                "primary_role": "",
            }

        # Fetch actual matches for W/L counting and role detection
        matches = await self._fetch_matches_batch(all_match_ids, platform)

        wins = 0
        losses = 0
        stats_list = []
        for match in matches:
            stat = extract_match_stats(match, puuid)
            if not stat:
                continue
            stats_list.append(stat)
            if stat.win:
                wins += 1
            else:
                losses += 1

        total = wins + losses
        primary_role = detect_primary_role(stats_list)

        return {
            "season": season_key,
            "season_label": season.label,
            "wins": wins,
            "losses": losses,
            "win_rate": round(wins / total * 100, 1) if total else 0.0,
            "games_played": total,
            "primary_role": primary_role,
        }

    async def _fetch_matches_batch(
        self,
        match_ids: list[str],
        platform: str,
    ) -> list[dict[str, Any]]:
        """Fetch multiple matches in parallel with error handling."""
        tasks = [
            self._safe_fetch(
                self._riot.get_match(mid, platform),
                default=None,
                label=f"match_{mid}",
            )
            for mid in match_ids
        ]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]

    @staticmethod
    async def _safe_fetch(
        coro: Any,
        default: Any = None,
        label: str = "unknown",
    ) -> Any:
        """Execute a coroutine, returning default on RiotAPIError."""
        try:
            return await coro
        except RiotAPIError:
            logger.warning("Failed to fetch %s", label, exc_info=True)
            return default


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
