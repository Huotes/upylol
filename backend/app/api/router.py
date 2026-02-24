"""Root API router — aggregates all versioned route modules."""

from fastapi import APIRouter

from app.api.v1 import analysis, champions, health, match_detail, matches, player, static

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(player.router, prefix="/v1", tags=["player"])
api_router.include_router(matches.router, prefix="/v1", tags=["matches"])
api_router.include_router(match_detail.router, prefix="/v1", tags=["match-detail"])
api_router.include_router(analysis.router, prefix="/v1", tags=["analysis"])
api_router.include_router(champions.router, prefix="/v1", tags=["champions"])
api_router.include_router(static.router, prefix="/v1", tags=["static"])
