"""Champion performance analysis and OTP finder.

Analyzes which champions the player performs best on and finds
one-trick-pony (OTP) references in higher elos.
"""

from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from app.analysis.stats_extractor import PlayerMatchStats


@dataclass(frozen=True)
class ChampionPerformance:
    """Aggregated performance on a specific champion."""

    champion_name: str
    games: int
    wins: int
    losses: int
    win_rate: float
    avg_kda: float
    avg_cs_per_min: float
    avg_damage_per_min: float
    avg_vision_per_min: float
    positions: list[str]


# Minimum games to consider statistically relevant
MIN_GAMES_FOR_RANKING = 3


def analyze_champions(
    per_match: list[PlayerMatchStats],
) -> list[ChampionPerformance]:
    """Aggregate stats per champion and rank by performance."""
    by_champ: dict[str, list[PlayerMatchStats]] = defaultdict(list)
    for m in per_match:
        by_champ[m.champion_name].append(m)

    results: list[ChampionPerformance] = []

    for champ_name, matches in by_champ.items():
        n = len(matches)
        wins = sum(1 for m in matches if m.win)
        positions = list({m.position for m in matches if m.position})

        avg_kda = sum(
            (m.kills + m.assists) / max(m.deaths, 1) for m in matches
        ) / n

        results.append(ChampionPerformance(
            champion_name=champ_name,
            games=n,
            wins=wins,
            losses=n - wins,
            win_rate=wins / n if n else 0.0,
            avg_kda=round(avg_kda, 2),
            avg_cs_per_min=round(
                sum(m.cs_per_min for m in matches) / n, 1,
            ),
            avg_damage_per_min=round(
                sum(m.damage_per_min for m in matches) / n, 0,
            ),
            avg_vision_per_min=round(
                sum(m.vision_per_min for m in matches) / n, 2,
            ),
            positions=positions,
        ))

    # Sort by: sufficient games first, then by weighted score
    return sorted(
        results,
        key=lambda c: _rank_score(c),
        reverse=True,
    )


def _rank_score(champ: ChampionPerformance) -> float:
    """Weighted ranking: win rate x games played x kda factor."""
    game_weight = min(champ.games / 10.0, 1.0)  # caps at 10 games
    kda_factor = min(champ.avg_kda / 3.0, 1.5)  # normalize around 3.0 KDA
    return champ.win_rate * game_weight * kda_factor


def get_best_champions(
    per_match: list[PlayerMatchStats],
    top_n: int = 5,
) -> list[ChampionPerformance]:
    """Return top N best-performing champions (min games filter)."""
    all_champs = analyze_champions(per_match)
    filtered = [c for c in all_champs if c.games >= MIN_GAMES_FOR_RANKING]

    # If not enough champs meet minimum, relax filter
    if len(filtered) < top_n:
        filtered = all_champs

    return filtered[:top_n]


def identify_mains(
    per_match: list[PlayerMatchStats],
    threshold: float = 0.25,
) -> list[str]:
    """Identify main champions (>25% of total games)."""
    total = len(per_match)
    if not total:
        return []

    champs = analyze_champions(per_match)
    return [
        c.champion_name for c in champs
        if c.games / total >= threshold
    ]


def suggest_champion_pool(
    performances: list[ChampionPerformance],
) -> dict[str, Any]:
    """Suggest ideal champion pool based on performance data."""
    if not performances:
        return {"suggestion": "Play more games to get recommendations."}

    best = performances[0]
    high_wr = [c for c in performances if c.win_rate >= 0.55 and c.games >= 3]

    return {
        "primary_pick": best.champion_name,
        "high_winrate_picks": [c.champion_name for c in high_wr[:3]],
        "pool_size": len([c for c in performances if c.games >= 3]),
        "recommendation": (
            f"Foque em {best.champion_name} como pick principal. "
            f"Você tem {best.win_rate:.0%} de win rate em "
            f"{best.games} partidas."
        ),
    }
