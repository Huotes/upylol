"""Temporal trend analysis — detect improvement or decline over time."""

from dataclasses import dataclass
from typing import Literal

from app.analysis.stats_extractor import PlayerMatchStats

Trend = Literal["improving", "stable", "declining"]

# Compare first half vs second half of match history
TREND_THRESHOLD = 0.10  # 10% change = significant


@dataclass(frozen=True)
class TrendResult:
    """Trend for a single metric."""

    metric: str
    trend: Trend
    early_avg: float
    recent_avg: float
    change_pct: float


def _compute_trend(
    metric: str,
    early: list[float],
    recent: list[float],
    invert: bool = False,
) -> TrendResult:
    """Compare early vs recent averages for a metric."""
    early_avg = sum(early) / len(early) if early else 0
    recent_avg = sum(recent) / len(recent) if recent else 0

    change = 0.0 if early_avg == 0 else (recent_avg - early_avg) / early_avg

    if invert:
        change = -change

    if change > TREND_THRESHOLD:
        trend: Trend = "improving"
    elif change < -TREND_THRESHOLD:
        trend = "declining"
    else:
        trend = "stable"

    return TrendResult(
        metric=metric,
        trend=trend,
        early_avg=round(early_avg, 2),
        recent_avg=round(recent_avg, 2),
        change_pct=round(change * 100, 1),
    )


def analyze_trends(
    per_match: list[PlayerMatchStats],
) -> list[TrendResult]:
    """Split matches into halves and compare key metrics."""
    if len(per_match) < 6:
        return []

    mid = len(per_match) // 2
    early = per_match[:mid]
    recent = per_match[mid:]

    return [
        _compute_trend(
            "cs_per_min",
            [m.cs_per_min for m in early],
            [m.cs_per_min for m in recent],
        ),
        _compute_trend(
            "kda",
            [(m.kills + m.assists) / max(m.deaths, 1) for m in early],
            [(m.kills + m.assists) / max(m.deaths, 1) for m in recent],
        ),
        _compute_trend(
            "vision_per_min",
            [m.vision_per_min for m in early],
            [m.vision_per_min for m in recent],
        ),
        _compute_trend(
            "deaths",
            [float(m.deaths) for m in early],
            [float(m.deaths) for m in recent],
            invert=True,  # fewer deaths = improving
        ),
        _compute_trend(
            "damage_per_min",
            [m.damage_per_min for m in early],
            [m.damage_per_min for m in recent],
        ),
    ]
