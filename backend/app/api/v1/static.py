"""Static game data endpoints — cached DDragon data.

Serves champion, item, and version data with aggressive HTTP caching.
Data only changes every ~2 weeks (per Riot patch cycle).
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse

from app.core.dependencies import get_ddragon_service
from app.riot.ddragon import DDragonService

router = APIRouter()


@router.get(
    "/static/data",
    summary="Get cached game static data (champions, items, version)",
)
async def get_static_data(
    ddragon: Annotated[DDragonService, Depends(get_ddragon_service)],
) -> ORJSONResponse:
    """Return DDragon version, champion map, and item data.

    This endpoint is designed to be called once on page load.
    Data is cached for 24 hours in Redis and only changes per patch.
    Frontend should cache this aggressively.
    """
    await ddragon.ensure_loaded()
    data = ddragon.get_static_data()
    return ORJSONResponse(
        content=data,
        headers={
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
            "X-DDragon-Version": ddragon.version,
        },
    )


@router.get(
    "/static/version",
    summary="Get current DDragon patch version",
)
async def get_version(
    ddragon: Annotated[DDragonService, Depends(get_ddragon_service)],
) -> ORJSONResponse:
    """Return just the current patch version."""
    await ddragon.ensure_loaded()
    return ORJSONResponse(
        content={"version": ddragon.version},
        headers={"Cache-Control": "public, max-age=3600"},
    )


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
