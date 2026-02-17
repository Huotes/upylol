"""Match history endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.core.dependencies import get_cache_service, get_riot_client
from app.riot.client import RiotClient
from app.services.cache_service import CacheService
from app.services.match_service import MatchService

router = APIRouter()


@router.get(
    "/matches/{puuid}",
    summary="Get match history for a player",
)
async def get_matches(
    puuid: Annotated[str, Path(description="Player PUUID")],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    platform: str = "br1",
    count: Annotated[int, Query(ge=1, le=100)] = 20,
    queue: int | None = 420,
) -> list[dict[str, Any]]:
    """Fetch recent match history with optional queue filter."""
    service = MatchService(riot, cache)
    return await service.get_match_history(puuid, platform, count, queue)
