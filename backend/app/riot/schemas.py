"""Pydantic models for Riot API response data.

Only fields we actually use are modeled (KISS principle).
Riot API responses contain many more fields — we ignore them via
model_config extra='ignore'.
"""

from pydantic import BaseModel, ConfigDict


class RiotAccount(BaseModel):
    """Account V1 response."""

    model_config = ConfigDict(extra="ignore")

    puuid: str
    gameName: str
    tagLine: str


class Summoner(BaseModel):
    """Summoner V4 response."""

    model_config = ConfigDict(extra="ignore")

    id: str
    accountId: str
    puuid: str
    profileIconId: int
    summonerLevel: int


class LeagueEntry(BaseModel):
    """League V4 entry response."""

    model_config = ConfigDict(extra="ignore")

    queueType: str
    tier: str = ""
    rank: str = ""
    leaguePoints: int = 0
    wins: int = 0
    losses: int = 0
    hotStreak: bool = False


class ChampionMastery(BaseModel):
    """Champion Mastery V4 response."""

    model_config = ConfigDict(extra="ignore")

    championId: int
    championLevel: int
    championPoints: int
    lastPlayTime: int


class MatchParticipant(BaseModel):
    """Key fields from a Match V5 participant."""

    model_config = ConfigDict(extra="ignore")

    puuid: str
    championId: int
    championName: str
    teamId: int
    win: bool

    # KDA
    kills: int
    deaths: int
    assists: int

    # Farming
    totalMinionsKilled: int
    neutralMinionsKilled: int

    # Damage
    totalDamageDealtToChampions: int
    totalDamageTaken: int

    # Vision
    visionScore: int
    wardsPlaced: int
    wardsKilled: int

    # Economy
    goldEarned: int
    goldSpent: int

    # Objectives
    turretKills: int = 0
    inhibitorKills: int = 0
    dragonKills: int = 0
    baronKills: int = 0

    # Items
    item0: int = 0
    item1: int = 0
    item2: int = 0
    item3: int = 0
    item4: int = 0
    item5: int = 0
    item6: int = 0

    # Lane/Role
    teamPosition: str = ""
    individualPosition: str = ""

    # Advanced (challenges sub-object, optional)
    challenges: dict | None = None


class MatchInfo(BaseModel):
    """Match V5 info section."""

    model_config = ConfigDict(extra="ignore")

    gameId: int
    gameDuration: int  # seconds
    gameMode: str
    gameType: str
    queueId: int
    platformId: str
    participants: list[MatchParticipant]


class MatchMetadata(BaseModel):
    """Match V5 metadata section."""

    model_config = ConfigDict(extra="ignore")

    matchId: str
    participants: list[str]  # PUUIDs


class MatchData(BaseModel):
    """Full Match V5 response."""

    model_config = ConfigDict(extra="ignore")

    metadata: MatchMetadata
    info: MatchInfo
