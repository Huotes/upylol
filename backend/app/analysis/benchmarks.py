"""Elo and role benchmark data for performance comparison.

Benchmarks represent average stats per rank and role, used to normalize
player performance into percentiles. Values derived from aggregate
data across high-volume stats sites (op.gg, lolalytics, leaguemath).

Two tiers of benchmarks:
  - BENCHMARKS: tier-only (legacy fallback)
  - ROLE_BENCHMARKS: tier × role (preferred)
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class EloBenchmark:
    """Average stats for a given rank tier (and optionally role)."""

    cs_per_min: float
    kda: float
    vision_per_min: float
    damage_per_min: float
    gold_per_min: float
    deaths_per_game: float
    kill_participation: float
    wards_per_game: float


# ── Tier-only benchmarks (fallback) ────────────────────────────────

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

DEFAULT_BENCHMARK = BENCHMARKS["SILVER"]


def get_benchmark(tier: str) -> EloBenchmark:
    """Get tier-only benchmark, defaulting to Silver."""
    return BENCHMARKS.get(tier.upper(), DEFAULT_BENCHMARK)


# ── Role-specific benchmarks (tier × role) ─────────────────────────
#
# Role multipliers relative to tier-average, based on community data:
#   TOP:     High CS, moderate damage, moderate vision
#   JUNGLE:  Low CS (camps), high vision, high KP
#   MIDDLE:  Highest CS, highest damage, moderate vision
#   BOTTOM:  Very high CS, high damage, low vision, high gold
#   UTILITY: Minimal CS, highest vision, highest KP, low damage/gold
#
# We generate role benchmarks programmatically from tier benchmarks
# using role-specific multipliers to keep the data DRY.

@dataclass(frozen=True)
class _RoleMultiplier:
    """Multipliers applied to tier benchmark to get role benchmark."""

    cs_per_min: float
    kda: float
    vision_per_min: float
    damage_per_min: float
    gold_per_min: float
    deaths_per_game: float
    kill_participation: float
    wards_per_game: float


_ROLE_MULTIPLIERS: dict[str, _RoleMultiplier] = {
    "TOP": _RoleMultiplier(
        cs_per_min=1.12,       # Slightly above average — solo lane farm
        kda=0.92,              # Slightly lower — island lane, more 1v1 deaths
        vision_per_min=0.88,   # Below average — less ward focus
        damage_per_min=1.05,   # Slightly above — sustained damage in fights
        gold_per_min=0.99,     # Average
        deaths_per_game=1.05,  # Slightly more deaths
        kill_participation=0.88,  # Lower — often split pushing
        wards_per_game=0.85,   # Below average
    ),
    "JUNGLE": _RoleMultiplier(
        cs_per_min=0.43,       # Much lower — jungle camps, not lane minions
        kda=1.08,              # Slightly above — picks ganks
        vision_per_min=1.30,   # High — objective control wards
        damage_per_min=0.90,   # Slightly below — less constant damage
        gold_per_min=0.92,     # Lower — no lane tax at higher elo
        deaths_per_game=1.00,  # Average
        kill_participation=1.18,  # High — involved in ganks
        wards_per_game=1.15,   # Above average
    ),
    "MIDDLE": _RoleMultiplier(
        cs_per_min=1.20,       # Highest CS among laners (short lane, easy farm)
        kda=1.04,              # Slightly above average
        vision_per_min=0.95,   # Average
        damage_per_min=1.20,   # Highest damage — mage/assassin burst
        gold_per_min=1.05,     # Above average
        deaths_per_game=0.97,  # Slightly fewer
        kill_participation=1.00,  # Average
        wards_per_game=0.93,   # Average
    ),
    "BOTTOM": _RoleMultiplier(
        cs_per_min=1.35,       # Highest CS — ADC farms everything late
        kda=1.08,              # Above average — protected role
        vision_per_min=0.72,   # Low — ADC doesn't ward much
        damage_per_min=1.12,   # High — primary damage source
        gold_per_min=1.10,     # Highest gold
        deaths_per_game=0.92,  # Fewer deaths (should be protected)
        kill_participation=1.00,  # Average
        wards_per_game=0.70,   # Low
    ),
    "UTILITY": _RoleMultiplier(
        cs_per_min=0.20,       # Minimal CS — support item, no farm
        kda=0.96,              # Slightly below (many assists, some deaths)
        vision_per_min=1.85,   # Highest — core support responsibility
        damage_per_min=0.52,   # Low — not a damage role
        gold_per_min=0.68,     # Low — support income
        deaths_per_game=1.08,  # Slightly more (roaming, engaging)
        kill_participation=1.22,  # Highest — always in fights
        wards_per_game=2.00,   # Highest ward count by far
    ),
}


def _build_role_benchmarks() -> dict[str, dict[str, EloBenchmark]]:
    """Generate role-specific benchmarks from tier benchmarks × multipliers."""
    result: dict[str, dict[str, EloBenchmark]] = {}
    for tier, base in BENCHMARKS.items():
        result[tier] = {}
        for role, mult in _ROLE_MULTIPLIERS.items():
            result[tier][role] = EloBenchmark(
                cs_per_min=round(base.cs_per_min * mult.cs_per_min, 1),
                kda=round(base.kda * mult.kda, 1),
                vision_per_min=round(base.vision_per_min * mult.vision_per_min, 2),
                damage_per_min=round(base.damage_per_min * mult.damage_per_min, 0),
                gold_per_min=round(base.gold_per_min * mult.gold_per_min, 0),
                deaths_per_game=round(base.deaths_per_game * mult.deaths_per_game, 1),
                kill_participation=round(base.kill_participation * mult.kill_participation, 2),
                wards_per_game=round(base.wards_per_game * mult.wards_per_game, 1),
            )
    return result


ROLE_BENCHMARKS: dict[str, dict[str, EloBenchmark]] = _build_role_benchmarks()


def get_role_benchmark(tier: str, role: str) -> EloBenchmark:
    """Get benchmark for a tier × role combination.

    Falls back to tier-only benchmark if role is unknown or empty.
    """
    if not role:
        return get_benchmark(tier)

    tier_upper = tier.upper()
    role_upper = role.upper()

    tier_roles = ROLE_BENCHMARKS.get(tier_upper)
    if not tier_roles:
        return get_benchmark(tier)

    return tier_roles.get(role_upper, get_benchmark(tier))
