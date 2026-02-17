"""Multidimensional performance scoring engine.

Inspired by Mobalytics GPI — scores player across 7 dimensions,
normalized against elo benchmarks.
"""

from dataclasses import dataclass

from app.analysis.benchmarks import EloBenchmark, get_benchmark
from app.analysis.stats_extractor import AggregatedStats


@dataclass(frozen=True)
class DimensionScore:
    """Score for a single performance dimension."""

    name: str
    score: float        # 0–100
    raw_value: float
    benchmark: float
    percentile: float   # 0–99


@dataclass(frozen=True)
class PerformanceProfile:
    """Complete performance analysis result."""

    overall_score: float
    dimensions: list[DimensionScore]
    strengths: list[str]
    weaknesses: list[str]


# Dimension weights (must sum to 1.0)
WEIGHTS: dict[str, float] = {
    "farming": 0.15,
    "fighting": 0.20,
    "vision": 0.15,
    "objectives": 0.10,
    "consistency": 0.15,
    "survivability": 0.15,
    "economy": 0.10,
}


def _ratio_to_score(ratio: float) -> float:
    """Convert a benchmark ratio to a 0–100 score."""
    return min(100.0, max(0.0, ratio * 50.0))


def _ratio_to_percentile(ratio: float) -> float:
    """Approximate percentile from benchmark ratio."""
    return min(99.0, max(1.0, ratio * 50.0))


def _score_farming(stats: AggregatedStats, bench: EloBenchmark) -> DimensionScore:
    ratio = stats.avg_cs_per_min / max(bench.cs_per_min, 0.01)
    return DimensionScore(
        name="farming",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_cs_per_min, 1),
        benchmark=bench.cs_per_min,
        percentile=_ratio_to_percentile(ratio),
    )


def _score_fighting(stats: AggregatedStats, bench: EloBenchmark) -> DimensionScore:
    ratio = stats.avg_kda / max(bench.kda, 0.01)
    return DimensionScore(
        name="fighting",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_kda, 2),
        benchmark=bench.kda,
        percentile=_ratio_to_percentile(ratio),
    )


def _score_vision(stats: AggregatedStats, bench: EloBenchmark) -> DimensionScore:
    ratio = stats.avg_vision_per_min / max(bench.vision_per_min, 0.01)
    return DimensionScore(
        name="vision",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_vision_per_min, 2),
        benchmark=bench.vision_per_min,
        percentile=_ratio_to_percentile(ratio),
    )


def _score_survivability(
    stats: AggregatedStats,
    bench: EloBenchmark,
) -> DimensionScore:
    # Inverse — fewer deaths = higher score
    ratio = bench.deaths_per_game / max(stats.avg_deaths, 0.01)
    return DimensionScore(
        name="survivability",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_deaths, 1),
        benchmark=bench.deaths_per_game,
        percentile=_ratio_to_percentile(ratio),
    )


def _score_economy(stats: AggregatedStats, bench: EloBenchmark) -> DimensionScore:
    ratio = stats.avg_gold_per_min / max(bench.gold_per_min, 0.01)
    return DimensionScore(
        name="economy",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_gold_per_min, 0),
        benchmark=bench.gold_per_min,
        percentile=_ratio_to_percentile(ratio),
    )


def _score_consistency(stats: AggregatedStats, _bench: EloBenchmark) -> DimensionScore:
    """Lower stddev in KDA = more consistent = higher score."""
    if stats.games_analyzed < 3:
        return DimensionScore(
            name="consistency", score=50.0,
            raw_value=0.0, benchmark=0.0, percentile=50.0,
        )
    # Normalize: stddev of 0 → score 100, stddev of 3+ → score ~30
    score = max(0.0, 100.0 - (stats.kda_stddev * 25.0))
    return DimensionScore(
        name="consistency",
        score=min(100.0, score),
        raw_value=round(stats.kda_stddev, 2),
        benchmark=0.0,
        percentile=min(99.0, score),
    )


def _score_objectives(stats: AggregatedStats, bench: EloBenchmark) -> DimensionScore:
    """Kill participation as proxy for objective involvement."""
    ratio = stats.avg_kill_participation / max(bench.kill_participation, 0.01)
    return DimensionScore(
        name="objectives",
        score=_ratio_to_score(ratio),
        raw_value=round(stats.avg_kill_participation * 100, 1),
        benchmark=bench.kill_participation * 100,
        percentile=_ratio_to_percentile(ratio),
    )


def analyze_performance(
    stats: AggregatedStats,
    tier: str,
) -> PerformanceProfile:
    """Run full performance analysis against elo benchmarks."""
    bench = get_benchmark(tier)

    scorers = [
        _score_farming, _score_fighting, _score_vision,
        _score_survivability, _score_economy, _score_consistency,
        _score_objectives,
    ]

    dimensions = [scorer(stats, bench) for scorer in scorers]

    overall = sum(
        dim.score * WEIGHTS.get(dim.name, 0.1) for dim in dimensions
    )

    strengths = [d.name for d in dimensions if d.score >= 65]
    weaknesses = [d.name for d in dimensions if d.score < 40]

    return PerformanceProfile(
        overall_score=round(overall, 1),
        dimensions=dimensions,
        strengths=strengths,
        weaknesses=weaknesses,
    )
