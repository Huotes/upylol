"""Champion analysis endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.analysis.champions import analyze_champions, suggest_champion_pool
from app.analysis.stats_extractor import aggregate_stats
from app.core.dependencies import get_cache_service, get_riot_client
from app.riot.client import RiotClient
from app.riot.seasons import get_current_season
from app.services.cache_service import CacheService
from app.services.match_service import MatchService

router = APIRouter()

# When count >= 100 the frontend means "Temporada" — fetch ALL season matches.
_SEASON_COUNT_THRESHOLD = 100


@router.get(
    "/champions/{puuid}",
    summary="Champion performance breakdown",
)
async def get_champions(
    puuid: Annotated[str, Path(description="Player PUUID")],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    platform: str = "br1",
    count: Annotated[int, Query(ge=5, le=500)] = 30,
    queue: int | None = 420,
) -> dict[str, Any]:
    """Get per-champion stats and champion pool recommendations.

    When count >= 100, fetches ALL matches in the current season (paginated).
    """
    match_svc = MatchService(riot, cache)

    start_time = None
    end_time = None
    if count >= _SEASON_COUNT_THRESHOLD:
        season = get_current_season()
        if season:
            start_time = season.start_ts
            end_time = season.end_ts

    matches = await match_svc.get_match_history(
        puuid, platform, count, queue,
        start_time=start_time,
        end_time=end_time,
    )

    stats = aggregate_stats(matches, puuid)
    champions = analyze_champions(stats.per_match)
    suggestion = suggest_champion_pool(champions)

    return {
        "games_analyzed": stats.games_analyzed,
        "champions": [
            {
                "champion_name": c.champion_name,
                "games": c.games,
                "wins": c.wins,
                "losses": c.losses,
                "win_rate": round(c.win_rate * 100, 1),
                "avg_kda": c.avg_kda,
                "avg_cs_per_min": c.avg_cs_per_min,
                "avg_damage_per_min": c.avg_damage_per_min,
                "avg_vision_per_min": c.avg_vision_per_min,
                "positions": c.positions,
            }
            for c in champions
        ],
        "pool_suggestion": suggestion,
    }
