"""Riot API constants: regions, queue types, ranks."""

from enum import StrEnum

# Platform → Continental routing (Match V5, Account V1)
PLATFORM_TO_REGION: dict[str, str] = {
    "br1": "americas",
    "na1": "americas",
    "la1": "americas",
    "la2": "americas",
    "oc1": "americas",
    "euw1": "europe",
    "eun1": "europe",
    "tr1": "europe",
    "ru": "europe",
    "kr": "asia",
    "jp1": "asia",
    "ph2": "asia",
    "sg2": "asia",
    "th2": "asia",
    "tw2": "asia",
    "vn2": "asia",
}


class QueueType(StrEnum):
    """Common queue IDs."""

    RANKED_SOLO = "420"
    RANKED_FLEX = "440"
    NORMAL_DRAFT = "400"
    NORMAL_BLIND = "430"
    ARAM = "450"


class Tier(StrEnum):
    """Ranked tiers."""

    IRON = "IRON"
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"
    EMERALD = "EMERALD"
    DIAMOND = "DIAMOND"
    MASTER = "MASTER"
    GRANDMASTER = "GRANDMASTER"
    CHALLENGER = "CHALLENGER"


TIER_ORDER: dict[str, int] = {tier: i for i, tier in enumerate(Tier)}

# Minimum game duration in seconds to count (skip remakes)
MIN_GAME_DURATION = 300
