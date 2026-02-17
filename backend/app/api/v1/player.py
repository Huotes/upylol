"""Player profile endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path

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
    platform: Annotated[str, Path(description="Platform (br1, na1, euw1...)")],
    game_name: Annotated[str, Path(description="Game name part of Riot ID")],
    tag_line: Annotated[str, Path(description="Tag line part of Riot ID")],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
) -> dict:
    """Fetch complete player profile including ranked data and masteries."""
    service = PlayerService(riot, cache)
    return await service.get_profile(game_name, tag_line, platform)
