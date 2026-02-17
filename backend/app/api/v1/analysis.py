"""Performance analysis endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.core.dependencies import get_cache_service, get_riot_client
from app.riot.client import RiotClient
from app.schemas.responses import AnalysisResponse, ErrorResponse
from app.services.analysis_service import AnalysisService
from app.services.cache_service import CacheService
from app.services.match_service import MatchService
from app.services.player_service import PlayerService

router = APIRouter()


@router.get(
    "/analysis/{platform}/{game_name}/{tag_line}",
    response_model=AnalysisResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Full performance analysis for a player",
)
async def get_analysis(
    platform: Annotated[str, Path(description="Platform (br1, na1...)")],
    game_name: Annotated[str, Path(description="Game name")],
    tag_line: Annotated[str, Path(description="Tag line")],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    count: Annotated[int, Query(ge=5, le=100)] = 30,
    queue: int | None = 420,
) -> dict[str, Any]:
    """Run full analysis: performance, diagnostics, champions, trends."""
    # 1. Resolve player
    player_svc = PlayerService(riot, cache)
    profile = await player_svc.get_profile(game_name, tag_line, platform)

    puuid = profile["puuid"]
    tier = profile["ranked"]["tier"]

    # 2. Fetch matches
    match_svc = MatchService(riot, cache)
    matches = await match_svc.get_match_history(puuid, platform, count, queue)

    # 3. Run analysis
    analysis_svc = AnalysisService(cache)
    return await analysis_svc.full_analysis(matches, puuid, tier)
