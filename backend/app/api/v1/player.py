"""Player profile endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.core.dependencies import get_cache_service, get_riot_client
from app.riot.client import RiotClient
from app.schemas.responses import ErrorResponse, PlayerProfile
from app.services.cache_service import CacheService
from app.services.player_service import PlayerService

router = APIRouter()


@router.get(
    "/player/{platform}/{game_name}/{tag_line}",
    response_model=PlayerProfile,
    responses={404: {"model": ErrorResponse}},
    summary="Get player profile by Riot ID",
)
async def get_player(
    platform: Annotated[
        str,
        Path(description="Platform (br1, na1, euw1...)", min_length=2, max_length=5),
    ],
    game_name: Annotated[
        str,
        Path(description="Game name part of Riot ID", min_length=1, max_length=16),
    ],
    tag_line: Annotated[
        str,
        Path(description="Tag line part of Riot ID", min_length=1, max_length=5),
    ],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
) -> dict[str, Any]:
    """Fetch complete player profile including ranked data and masteries."""
    service = PlayerService(riot, cache)
    return await service.get_profile(game_name, tag_line, platform)


@router.get(
    "/player/{platform}/{game_name}/{tag_line}/season-stats",
    summary="Get player season stats (W/L, role) by season",
)
async def get_season_stats(
    platform: Annotated[
        str,
        Path(description="Platform (br1, na1, euw1...)", min_length=2, max_length=5),
    ],
    game_name: Annotated[
        str,
        Path(description="Game name part of Riot ID", min_length=1, max_length=16),
    ],
    tag_line: Annotated[
        str,
        Path(description="Tag line part of Riot ID", min_length=1, max_length=5),
    ],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    season: Annotated[str, Query(description="Season key (current, 2025_S1, etc.)")] = "current",
) -> dict[str, Any]:
    """Fetch player W/L, win rate, and primary role for a season."""
    service = PlayerService(riot, cache)
    profile = await service.get_profile(game_name, tag_line, platform)
    puuid = profile["puuid"]
    return await service.get_season_stats(puuid, platform, season)
