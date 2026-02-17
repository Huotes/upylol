"""Pydantic response models for API endpoints."""

from pydantic import BaseModel


class RankedInfo(BaseModel):
    """Ranked queue info."""

    tier: str
    rank: str
    lp: int
    wins: int
    losses: int
    win_rate: float
    hot_streak: bool


class PlayerProfile(BaseModel):
    """Player profile response."""

    puuid: str
    game_name: str
    tag_line: str
    platform: str
    summoner_level: int
    profile_icon_id: int
    ranked: RankedInfo
    top_mastery: list[dict]


class DimensionResponse(BaseModel):
    """Single performance dimension."""

    name: str
    score: float
    raw_value: float
    benchmark: float
    percentile: float


class PerformanceResponse(BaseModel):
    """Performance scoring result."""

    overall_score: float
    dimensions: list[DimensionResponse]
    strengths: list[str]
    weaknesses: list[str]


class DiagnosticResponse(BaseModel):
    """Single diagnostic finding."""

    category: str
    severity: str
    title: str
    description: str
    recommendation: str


class ChampionResponse(BaseModel):
    """Champion performance entry."""

    champion_name: str
    games: int
    win_rate: float
    avg_kda: float
    avg_cs_per_min: float
    positions: list[str]


class TrendResponse(BaseModel):
    """Trend for a metric."""

    metric: str
    trend: str
    early_avg: float
    recent_avg: float
    change_pct: float


class AnalysisResponse(BaseModel):
    """Full analysis response."""

    games_analyzed: int
    wins: int
    losses: int
    win_rate: float
    performance: PerformanceResponse
    diagnostics: list[DiagnosticResponse]
    best_champions: list[ChampionResponse]
    mains: list[str]
    champion_pool: dict
    trends: list[TrendResponse]


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str
