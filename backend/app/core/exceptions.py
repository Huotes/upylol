"""Custom exceptions and FastAPI exception handlers."""

from fastapi import Request
from fastapi.responses import ORJSONResponse


class AppError(Exception):
    """Base application error."""

    def __init__(
        self,
        message: str = "Internal error",
        status_code: int = 500,
    ) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class RiotAPIError(AppError):
    """Error communicating with Riot Games API."""

    def __init__(self, status_code: int, detail: str = "") -> None:
        riot_messages = {
            400: "Bad request to Riot API",
            401: "Invalid or expired Riot API key",
            403: "Forbidden — check API key permissions",
            404: "Summoner or resource not found",
            429: "Rate limit exceeded — try again later",
            500: "Riot API internal error",
            503: "Riot API temporarily unavailable",
        }
        message = riot_messages.get(status_code, f"Riot API error: {detail}")
        super().__init__(message=message, status_code=status_code)


class PlayerNotFoundError(AppError):
    """Player not found in specified region."""

    def __init__(self, game_name: str, tag_line: str) -> None:
        super().__init__(
            message=f"Player '{game_name}#{tag_line}' not found",
            status_code=404,
        )


class CacheError(AppError):
    """Cache read/write failure (non-fatal)."""

    def __init__(self, detail: str = "Cache operation failed") -> None:
        super().__init__(message=detail, status_code=500)


async def app_error_handler(_request: Request, exc: AppError) -> ORJSONResponse:
    """Handle all AppError subclasses uniformly."""
    return ORJSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message},
    )
