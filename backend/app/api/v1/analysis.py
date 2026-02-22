"""Performance analysis endpoints."""

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Query

from app.core.dependencies import get_cache_service, get_riot_client
from app.core.exceptions import AppError
from app.riot.client import RiotClient
from app.schemas.responses import AnalysisResponse, ErrorResponse
from app.services.analysis_service import AnalysisService
from app.services.cache_service import CacheService
from app.services.match_service import MatchService
from app.services.player_service import PlayerService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/analysis/{platform}/{game_name}/{tag_line}",
    response_model=AnalysisResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Full performance analysis for a player",
)
async def get_analysis(
    platform: Annotated[
        str,
        Path(description="Platform (br1, na1...)", min_length=2, max_length=5),
    ],
    game_name: Annotated[
        str,
        Path(description="Game name", min_length=1, max_length=16),
    ],
    tag_line: Annotated[
        str,
        Path(description="Tag line", min_length=1, max_length=5),
    ],
    riot: Annotated[RiotClient, Depends(get_riot_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    count: Annotated[int, Query(ge=5, le=100)] = 30,
    queue: int | None = 420,
) -> dict[str, Any]:
    """Run full analysis: performance, diagnostics, champions, trends."""
    # 1. Resolve player profile
    player_svc = PlayerService(riot, cache)
    profile = await player_svc.get_profile(game_name, tag_line, platform)

    puuid = profile.get("puuid", "")
    tier = profile.get("ranked", {}).get("tier", "GOLD")

    if not puuid:
        raise AppError("Could not resolve player PUUID", 404)

    # 2. Fetch match history
    match_svc = MatchService(riot, cache)
    matches = await match_svc.get_match_history(puuid, platform, count, queue)

    if not matches:
        logger.info(
            "No matches found for %s on %s (queue=%s)",
            puuid, platform, queue,
        )
        raise AppError(
            f"No ranked matches found for {game_name}#{tag_line}. "
            "Try playing some games first.",
            404,
        )

    # 3. Run analysis pipeline
    analysis_svc = AnalysisService(cache)
    return await analysis_svc.full_analysis(matches, puuid, tier)
