"""Elo benchmark data for performance comparison.

Benchmarks represent average stats per rank, used to normalize
player performance into percentiles. Values derived from aggregate
data across high-volume stats sites.

These are initial seed values — in production, benchmarks should
be periodically recalculated from collected match data.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class EloBenchmark:
    """Average stats for a given rank tier."""

    cs_per_min: float
    kda: float
    vision_per_min: float
    damage_per_min: float
    gold_per_min: float
    deaths_per_game: float
    kill_participation: float
    wards_per_game: float


# Average stats by tier (approximate, based on community data)
BENCHMARKS: dict[str, EloBenchmark] = {
    "IRON": EloBenchmark(
        cs_per_min=3.8, kda=1.8, vision_per_min=0.35,
        damage_per_min=380, gold_per_min=320, deaths_per_game=7.5,
        kill_participation=0.45, wards_per_game=4.0,
    ),
    "BRONZE": EloBenchmark(
        cs_per_min=4.5, kda=2.0, vision_per_min=0.40,
        damage_per_min=420, gold_per_min=340, deaths_per_game=7.0,
        kill_participation=0.48, wards_per_game=5.0,
    ),
    "SILVER": EloBenchmark(
        cs_per_min=5.2, kda=2.3, vision_per_min=0.50,
        damage_per_min=470, gold_per_min=360, deaths_per_game=6.5,
        kill_participation=0.50, wards_per_game=6.0,
    ),
    "GOLD": EloBenchmark(
        cs_per_min=5.8, kda=2.6, vision_per_min=0.60,
        damage_per_min=520, gold_per_min=385, deaths_per_game=6.0,
        kill_participation=0.52, wards_per_game=7.0,
    ),
    "PLATINUM": EloBenchmark(
        cs_per_min=6.3, kda=2.8, vision_per_min=0.70,
        damage_per_min=560, gold_per_min=400, deaths_per_game=5.5,
        kill_participation=0.55, wards_per_game=8.0,
    ),
    "EMERALD": EloBenchmark(
        cs_per_min=6.8, kda=3.0, vision_per_min=0.80,
        damage_per_min=600, gold_per_min=420, deaths_per_game=5.2,
        kill_participation=0.57, wards_per_game=9.0,
    ),
    "DIAMOND": EloBenchmark(
        cs_per_min=7.2, kda=3.2, vision_per_min=0.90,
        damage_per_min=640, gold_per_min=440, deaths_per_game=5.0,
        kill_participation=0.58, wards_per_game=10.0,
    ),
    "MASTER": EloBenchmark(
        cs_per_min=7.8, kda=3.5, vision_per_min=1.00,
        damage_per_min=700, gold_per_min=470, deaths_per_game=4.8,
        kill_participation=0.60, wards_per_game=11.0,
    ),
    "GRANDMASTER": EloBenchmark(
        cs_per_min=8.0, kda=3.7, vision_per_min=1.05,
        damage_per_min=730, gold_per_min=490, deaths_per_game=4.5,
        kill_participation=0.62, wards_per_game=12.0,
    ),
    "CHALLENGER": EloBenchmark(
        cs_per_min=8.3, kda=4.0, vision_per_min=1.10,
        damage_per_min=760, gold_per_min=510, deaths_per_game=4.2,
        kill_participation=0.64, wards_per_game=13.0,
    ),
}

# Fallback for unranked players
DEFAULT_BENCHMARK = BENCHMARKS["SILVER"]


def get_benchmark(tier: str) -> EloBenchmark:
    """Get benchmark for a tier, defaulting to Silver."""
    return BENCHMARKS.get(tier.upper(), DEFAULT_BENCHMARK)
