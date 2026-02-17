"""UPYLOL — FastAPI application factory."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.core.database import close_db, init_db
from app.core.dependencies import get_riot_client
from app.core.exceptions import AppError, app_error_handler
from app.core.redis import close_redis, init_redis


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Manage startup and shutdown lifecycle events."""
    await init_db()
    await init_redis()
    yield
    await get_riot_client().close()
    await close_db()
    await close_redis()


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )

    app.add_exception_handler(AppError, app_error_handler)
    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
