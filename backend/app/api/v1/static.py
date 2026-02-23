"""Static game data endpoints — cached DDragon data."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse

from app.core.dependencies import get_ddragon_service
from app.riot.ddragon import DDragonService

router = APIRouter()


@router.get(
    "/static/data",
    summary="Get cached game static data (champions, items, version)",
    response_class=ORJSONResponse,
)
async def get_static_data(
    ddragon: Annotated[DDragonService, Depends(get_ddragon_service)],
) -> dict[str, Any]:
    """Return DDragon version, champion map, and item data.

    This endpoint is designed to be called once on page load.
    Data is cached for 24 hours in Redis and only changes per patch.
    """
    await ddragon.ensure_loaded()
    return ddragon.get_static_data()


@router.get(
    "/static/version",
    summary="Get current DDragon patch version",
)
async def get_version(
    ddragon: Annotated[DDragonService, Depends(get_ddragon_service)],
) -> dict[str, str]:
    """Return just the current patch version."""
    await ddragon.ensure_loaded()
    return {"version": ddragon.version}


@router.post(
    "/static/refresh",
    summary="Force refresh DDragon data (admin)",
)
async def refresh_static(
    ddragon: Annotated[DDragonService, Depends(get_ddragon_service)],
) -> dict[str, str]:
    """Force refresh DDragon data from CDN."""
    await ddragon.refresh()
    return {"status": "ok", "version": ddragon.version}
