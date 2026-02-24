"""Health check endpoints."""

import logging

from fastapi import APIRouter

from app.config import settings
from app.core.dependencies import get_ddragon_service
from app.core.redis import get_redis
from app.schemas.responses import HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return application health status (used by Docker healthcheck)."""
    return HealthResponse(status="ok", version=settings.APP_VERSION)


@router.get("/health/detailed")
async def health_detailed() -> dict:
    """Detailed health including Redis and DDragon status."""
    checks: dict = {
        "status": "ok",
        "version": settings.APP_VERSION,
        "redis": "unknown",
        "ddragon_version": "unknown",
        "ddragon_champions": 0,
    }

    # Check Redis
    try:
        r = get_redis()
        await r.ping()
        checks["redis"] = "connected"
    except Exception as exc:
        checks["redis"] = f"error: {exc}"
        checks["status"] = "degraded"

    # Check DDragon
    try:
        ddragon = get_ddragon_service()
        checks["ddragon_version"] = ddragon.version or "not loaded"
        checks["ddragon_champions"] = len(ddragon.champions)
    except Exception as exc:
        checks["ddragon_version"] = f"error: {exc}"
        checks["status"] = "degraded"

    return checks
