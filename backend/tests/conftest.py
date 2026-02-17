"""Shared test fixtures."""

import pytest

from app.analysis.stats_extractor import PlayerMatchStats


@pytest.fixture
def sample_match_data() -> dict:
    """Minimal match data for testing."""
    return {
        "metadata": {
            "matchId": "BR1_12345",
            "participants": ["puuid-test-1"],
        },
        "info": {
            "gameId": 12345,
            "gameDuration": 1800,  # 30 min
            "gameMode": "CLASSIC",
            "gameType": "MATCHED_GAME",
            "queueId": 420,
            "platformId": "BR1",
            "participants": [
                {
                    "puuid": "puuid-test-1",
                    "championId": 222,
                    "championName": "Jinx",
                    "teamId": 100,
                    "win": True,
                    "kills": 8,
                    "deaths": 3,
                    "assists": 12,
                    "totalMinionsKilled": 180,
                    "neutralMinionsKilled": 20,
                    "totalDamageDealtToChampions": 25000,
                    "totalDamageTaken": 15000,
                    "visionScore": 22,
                    "wardsPlaced": 8,
                    "wardsKilled": 3,
                    "goldEarned": 14500,
                    "goldSpent": 13200,
                    "turretKills": 2,
                    "inhibitorKills": 1,
                    "dragonKills": 0,
                    "baronKills": 0,
                    "item0": 3031,
                    "item1": 3006,
                    "item2": 3094,
                    "item3": 3036,
                    "item4": 0,
                    "item5": 0,
                    "item6": 3340,
                    "teamPosition": "BOTTOM",
                    "individualPosition": "BOTTOM",
                    "challenges": {
                        "killParticipation": 0.62,
                        "laneMinionsFirst10Minutes": 72,
                        "soloKills": 2,
                    },
                },
            ],
        },
    }


@pytest.fixture
def sample_player_match_stats() -> PlayerMatchStats:
    """Pre-built PlayerMatchStats for unit tests."""
    return PlayerMatchStats(
        match_id="BR1_12345",
        champion_name="Jinx",
        win=True,
        kills=8,
        deaths=3,
        assists=12,
        cs_per_min=6.67,
        vision_per_min=0.73,
        damage_per_min=833.33,
        gold_per_min=483.33,
        kill_participation=0.62,
        wards_placed=8,
        wards_killed=3,
        duration_min=30.0,
        position="BOTTOM",
    )
