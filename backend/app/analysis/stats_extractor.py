"""Extract and aggregate player stats from match data.

Single responsibility: transform raw match JSON into clean stat dicts.
Used by both performance analyzer and diagnostics engine (DRY).
"""

from dataclasses import dataclass, field
from statistics import mean, stdev
from typing import Any

from app.riot.constants import MIN_GAME_DURATION


@dataclass
class PlayerMatchStats:
    """Stats from a single match for one player."""

    match_id: str
    champion_name: str
    win: bool
    kills: int
    deaths: int
    assists: int
    cs_per_min: float
    vision_per_min: float
    damage_per_min: float
    gold_per_min: float
    kill_participation: float
    wards_placed: int
    wards_killed: int
    duration_min: float
    position: str


@dataclass
class AggregatedStats:
    """Averaged stats across multiple matches."""

    games_analyzed: int = 0
    wins: int = 0
    losses: int = 0
    avg_kills: float = 0.0
    avg_deaths: float = 0.0
    avg_assists: float = 0.0
    avg_kda: float = 0.0
    avg_cs_per_min: float = 0.0
    avg_vision_per_min: float = 0.0
    avg_damage_per_min: float = 0.0
    avg_gold_per_min: float = 0.0
    avg_kill_participation: float = 0.0
    avg_wards_per_game: float = 0.0
    kda_stddev: float = 0.0
    cs_stddev: float = 0.0
    deaths_stddev: float = 0.0
    per_match: list[PlayerMatchStats] = field(default_factory=list)


def find_participant(
    match: dict[str, Any],
    puuid: str,
) -> dict[str, Any] | None:
    """Find a player's participant data in a match."""
    for participant in match.get("info", {}).get("participants", []):
        if participant.get("puuid") == puuid:
            return participant
    return None


def extract_match_stats(
    match: dict[str, Any],
    puuid: str,
) -> PlayerMatchStats | None:
    """Extract key stats for a player from a single match."""
    p = find_participant(match, puuid)
    if not p:
        return None

    duration_sec = match["info"].get("gameDuration", 0)
    if duration_sec < MIN_GAME_DURATION:
        return None

    duration_min = duration_sec / 60
    cs = p.get("totalMinionsKilled", 0) + p.get("neutralMinionsKilled", 0)
    challenges = p.get("challenges", {}) or {}

    return PlayerMatchStats(
        match_id=match["metadata"]["matchId"],
        champion_name=p.get("championName", "Unknown"),
        win=p.get("win", False),
        kills=p.get("kills", 0),
        deaths=p.get("deaths", 0),
        assists=p.get("assists", 0),
        cs_per_min=cs / duration_min,
        vision_per_min=p.get("visionScore", 0) / duration_min,
        damage_per_min=p.get("totalDamageDealtToChampions", 0) / duration_min,
        gold_per_min=p.get("goldEarned", 0) / duration_min,
        kill_participation=challenges.get("killParticipation", 0.0),
        wards_placed=p.get("wardsPlaced", 0),
        wards_killed=p.get("wardsKilled", 0),
        duration_min=duration_min,
        position=p.get("teamPosition", ""),
    )


def aggregate_stats(
    matches: list[dict[str, Any]],
    puuid: str,
) -> AggregatedStats:
    """Aggregate stats across all valid matches for a player."""
    per_match: list[PlayerMatchStats] = []
    for match in matches:
        stats = extract_match_stats(match, puuid)
        if stats:
            per_match.append(stats)

    if not per_match:
        return AggregatedStats()

    n = len(per_match)
    kills_list = [s.kills for s in per_match]
    deaths_list = [s.deaths for s in per_match]
    assists_list = [s.assists for s in per_match]
    kda_list = [
        (s.kills + s.assists) / max(s.deaths, 1) for s in per_match
    ]

    cs_list = [s.cs_per_min for s in per_match]

    return AggregatedStats(
        games_analyzed=n,
        wins=sum(1 for s in per_match if s.win),
        losses=sum(1 for s in per_match if not s.win),
        avg_kills=mean(kills_list),
        avg_deaths=mean(deaths_list),
        avg_assists=mean(assists_list),
        avg_kda=mean(kda_list),
        avg_cs_per_min=mean(cs_list),
        avg_vision_per_min=mean(s.vision_per_min for s in per_match),
        avg_damage_per_min=mean(s.damage_per_min for s in per_match),
        avg_gold_per_min=mean(s.gold_per_min for s in per_match),
        avg_kill_participation=mean(s.kill_participation for s in per_match),
        avg_wards_per_game=mean(s.wards_placed for s in per_match),
        kda_stddev=stdev(kda_list) if n > 1 else 0.0,
        cs_stddev=stdev(cs_list) if n > 1 else 0.0,
        deaths_stddev=stdev([float(d) for d in deaths_list]) if n > 1 else 0.0,
        per_match=per_match,
    )
