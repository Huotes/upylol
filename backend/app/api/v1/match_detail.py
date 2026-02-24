"""Match detail endpoint with deep per-match analysis."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.core.dependencies import get_cache_service, get_riot_client
from app.riot.client import RiotClient
from app.services.cache_service import CacheService
from app.services.match_service import MatchService

router = APIRouter()


@router.get(
    "/matches/{match_id}/detail",
    summary="Get detailed match analysis with timeline",
)
async def get_match_detail(
    match_id: Annotated[str, Path(description="Riot Match ID (e.g. BR1_123456)")],
    puuid: Annotated[str, Query(description="Player PUUID to analyze")],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    platform: str = "br1",
    tier: str = "SILVER",
) -> dict[str, Any]:
    """Fetch full match detail including timeline and deep analysis.

    Returns match data, team scoreboards, gold/CS diff timelines,
    death analysis, objective tracking, and improvement recommendations.
    """
    service = MatchService(riot, cache)
    return await service.get_match_detail(match_id, puuid, platform, tier)
