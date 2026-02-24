"""Per-match deep analysis engine.

Enriches a single match with timeline data, benchmark comparison,
death analysis, objective tracking, and improvement recommendations.

This is different from the aggregate analysis (diagnostics.py) —
here we analyze ONE game in depth instead of averages across many.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from app.analysis.benchmarks import EloBenchmark, get_benchmark

logger = logging.getLogger(__name__)

# ── Data classes ────────────────────────────────────────────────

@dataclass
class ParticipantDetail:
    """Enriched participant data for scoreboard display."""
    puuid: str
    champion_name: str
    team_id: int
    position: str
    win: bool
    kills: int
    deaths: int
    assists: int
    cs: int
    cs_per_min: float
    gold_earned: int
    gold_per_min: float
    damage_dealt: int
    damage_per_min: float
    damage_taken: int
    vision_score: int
    vision_per_min: float
    wards_placed: int
    wards_killed: int
    kill_participation: float
    items: list[int]
    summoner_spells: list[int]
    champion_level: int
    summoner_name: str


@dataclass
class DeathEvent:
    """A single death with context for analysis."""
    timestamp_sec: int
    game_phase: str  # "early" | "mid" | "late"
    position_x: int
    position_y: int
    killer: str
    assisters: list[str]
    description: str


@dataclass
class ObjectiveEvent:
    """Dragon, Baron, Tower, Herald event."""
    timestamp_sec: int
    event_type: str  # "dragon" | "baron" | "herald" | "tower" | "inhibitor"
    team: str  # "ally" | "enemy"
    subtype: str  # dragon type, tower lane, etc.


@dataclass
class GoldDiffPoint:
    """Gold difference at a specific minute."""
    minute: int
    gold_diff: int  # positive = player's team ahead


@dataclass
class PhaseStats:
    """Player stats for a game phase."""
    phase: str  # "early" | "mid" | "late"
    kills: int
    deaths: int
    assists: int
    cs: int
    cs_per_min: float
    gold: int
    gold_per_min: float


@dataclass
class ImprovementPoint:
    """One specific thing the player could improve from this match."""
    category: str  # "deaths" | "farming" | "vision" | "objectives" | "positioning"
    severity: str  # "critical" | "important" | "minor"
    title: str
    description: str
    recommendation: str


@dataclass
class MatchDetailAnalysis:
    """Complete per-match analysis result."""
    match_id: str
    duration_sec: int
    duration_min: float
    queue_id: int
    game_start_timestamp: int

    # Player stats
    player: ParticipantDetail
    player_team: list[ParticipantDetail]
    enemy_team: list[ParticipantDetail]

    # Benchmark comparison
    stats_vs_benchmark: dict[str, Any] = field(default_factory=dict)

    # Timeline
    gold_diff_timeline: list[GoldDiffPoint] = field(default_factory=list)

    # Phase breakdown
    phase_stats: list[PhaseStats] = field(default_factory=list)

    # Deaths
    deaths: list[DeathEvent] = field(default_factory=list)

    # Objectives
    objectives: list[ObjectiveEvent] = field(default_factory=list)
    ally_dragons: int = 0
    enemy_dragons: int = 0
    ally_barons: int = 0
    enemy_barons: int = 0
    ally_heralds: int = 0
    enemy_heralds: int = 0
    ally_towers: int = 0
    enemy_towers: int = 0

    # Improvement areas
    improvement_points: list[ImprovementPoint] = field(default_factory=list)

    # MVP / performance grade
    performance_grade: str = ""  # "S+" to "D"


# ── Analyzer ────────────────────────────────────────────────────

class MatchDetailAnalyzer:
    """Analyze a single match + timeline into deep insights."""

    def analyze(
        self,
        match: dict[str, Any],
        timeline: dict[str, Any] | None,
        puuid: str,
        tier: str,
    ) -> dict[str, Any]:
        """Run full per-match analysis and return serializable dict."""
        info = match.get("info", {})
        participants = info.get("participants", [])
        duration_sec = info.get("gameDuration", 0)
        duration_min = duration_sec / 60 if duration_sec > 0 else 1

        # Find the player
        player_data = None
        player_team_id = 100
        for p in participants:
            if p.get("puuid") == puuid:
                player_data = p
                player_team_id = p.get("teamId", 100)
                break

        if not player_data:
            return {"error": "Player not found in match"}

        # Build participant details
        player_detail = self._build_participant(player_data, duration_min)
        player_team = []
        enemy_team = []
        for p in participants:
            detail = self._build_participant(p, duration_min)
            if p.get("teamId") == player_team_id:
                player_team.append(detail)
            else:
                enemy_team.append(detail)

        # Benchmark comparison
        bench = get_benchmark(tier)
        stats_vs = self._compare_benchmark(player_detail, bench, tier)

        # Timeline analysis
        gold_diff_timeline: list[dict] = []
        deaths_list: list[dict] = []
        objectives_list: list[dict] = []
        phase_stats_list: list[dict] = []

        ally_dragons = 0
        enemy_dragons = 0
        ally_barons = 0
        enemy_barons = 0
        ally_heralds = 0
        enemy_heralds = 0
        ally_towers = 0
        enemy_towers = 0

        if timeline:
            # Get participant ID mapping
            pid_map = self._build_participant_id_map(timeline, participants)
            player_pid = self._get_player_pid(timeline, puuid)

            # Gold diff per minute
            gold_diff_timeline = self._extract_gold_diff(
                timeline, player_team_id, pid_map,
            )

            # Deaths
            deaths_list = self._extract_deaths(
                timeline, puuid, player_pid, pid_map, duration_min,
            )

            # Objectives
            (
                objectives_list,
                ally_dragons, enemy_dragons,
                ally_barons, enemy_barons,
                ally_heralds, enemy_heralds,
                ally_towers, enemy_towers,
            ) = self._extract_objectives(timeline, player_team_id, pid_map)

            # Phase stats from timeline
            phase_stats_list = self._extract_phase_stats(
                timeline, player_pid, duration_min,
            )

        # Improvement points
        improvements = self._generate_improvements(
            player_detail, bench, tier, deaths_list,
            ally_dragons, enemy_dragons,
            ally_barons, enemy_barons,
            duration_min,
        )

        # Performance grade
        grade = self._calculate_grade(player_detail, bench)

        # Sort teams by position order
        pos_order = {"TOP": 0, "JUNGLE": 1, "MIDDLE": 2, "BOTTOM": 3, "UTILITY": 4}
        player_team.sort(key=lambda p: pos_order.get(p["position"], 5))
        enemy_team.sort(key=lambda p: pos_order.get(p["position"], 5))

        return {
            "match_id": match.get("metadata", {}).get("matchId", ""),
            "duration_sec": duration_sec,
            "duration_min": round(duration_min, 1),
            "queue_id": info.get("queueId", 0),
            "game_start_timestamp": info.get("gameStartTimestamp", 0),
            "player": player_detail,
            "player_team": player_team,
            "enemy_team": enemy_team,
            "stats_vs_benchmark": stats_vs,
            "gold_diff_timeline": gold_diff_timeline,
            "phase_stats": phase_stats_list,
            "deaths": deaths_list,
            "objectives": objectives_list,
            "ally_dragons": ally_dragons,
            "enemy_dragons": enemy_dragons,
            "ally_barons": ally_barons,
            "enemy_barons": enemy_barons,
            "ally_heralds": ally_heralds,
            "enemy_heralds": enemy_heralds,
            "ally_towers": ally_towers,
            "enemy_towers": enemy_towers,
            "improvement_points": improvements,
            "performance_grade": grade,
        }

    # ── Helpers ──────────────────────────────────────────────

    def _build_participant(
        self, p: dict[str, Any], duration_min: float,
    ) -> dict[str, Any]:
        """Build a clean participant detail dict."""
        cs = p.get("totalMinionsKilled", 0) + p.get("neutralMinionsKilled", 0)
        challenges = p.get("challenges", {}) or {}

        return {
            "puuid": p.get("puuid", ""),
            "champion_name": p.get("championName", "Unknown"),
            "team_id": p.get("teamId", 0),
            "position": p.get("teamPosition", ""),
            "win": p.get("win", False),
            "kills": p.get("kills", 0),
            "deaths": p.get("deaths", 0),
            "assists": p.get("assists", 0),
            "cs": cs,
            "cs_per_min": round(cs / max(duration_min, 1), 1),
            "gold_earned": p.get("goldEarned", 0),
            "gold_per_min": round(p.get("goldEarned", 0) / max(duration_min, 1), 0),
            "damage_dealt": p.get("totalDamageDealtToChampions", 0),
            "damage_per_min": round(
                p.get("totalDamageDealtToChampions", 0) / max(duration_min, 1), 0,
            ),
            "damage_taken": p.get("totalDamageTaken", 0),
            "vision_score": p.get("visionScore", 0),
            "vision_per_min": round(
                p.get("visionScore", 0) / max(duration_min, 1), 2,
            ),
            "wards_placed": p.get("wardsPlaced", 0),
            "wards_killed": p.get("wardsKilled", 0),
            "kill_participation": round(
                challenges.get("killParticipation", 0) * 100, 1,
            ),
            "items": [
                p.get(f"item{i}", 0) for i in range(7)
            ],
            "summoner_spells": [
                p.get("summoner1Id", 0),
                p.get("summoner2Id", 0),
            ],
            "champion_level": p.get("champLevel", 1),
            "summoner_name": p.get("riotIdGameName", p.get("summonerName", "")),
        }

    def _compare_benchmark(
        self,
        player: dict[str, Any],
        bench: EloBenchmark,
        tier: str,
    ) -> dict[str, Any]:
        """Compare player stats vs elo benchmark."""
        def _stat(val: float, bm: float, higher_better: bool = True) -> dict:
            diff = val - bm
            pct = round((val / max(bm, 0.01)) * 100, 1)
            return {
                "value": val,
                "benchmark": bm,
                "diff": round(diff, 1),
                "percentile": min(pct, 200),
                "tier": tier,
                "status": (
                    "above" if (diff > 0 and higher_better) or (diff < 0 and not higher_better)
                    else "below" if (diff < 0 and higher_better) or (diff > 0 and not higher_better)
                    else "at"
                ),
            }

        return {
            "cs_per_min": _stat(player["cs_per_min"], bench.cs_per_min),
            "damage_per_min": _stat(player["damage_per_min"], bench.damage_per_min),
            "gold_per_min": _stat(player["gold_per_min"], bench.gold_per_min),
            "vision_per_min": _stat(player["vision_per_min"], bench.vision_per_min),
            "deaths": _stat(player["deaths"], bench.deaths_per_game, higher_better=False),
            "kill_participation": _stat(
                player["kill_participation"],
                bench.kill_participation * 100,
            ),
        }

    def _build_participant_id_map(
        self,
        timeline: dict[str, Any],
        participants: list[dict[str, Any]],
    ) -> dict[int, dict[str, Any]]:
        """Map timeline participant ID (1-10) to participant data."""
        pid_map: dict[int, dict[str, Any]] = {}
        tl_participants = timeline.get("info", {}).get("participants", [])

        for tl_p in tl_participants:
            pid = tl_p.get("participantId", 0)
            puuid = tl_p.get("puuid", "")
            # Find matching participant in match data
            for p in participants:
                if p.get("puuid") == puuid:
                    pid_map[pid] = {
                        "puuid": puuid,
                        "champion_name": p.get("championName", ""),
                        "team_id": p.get("teamId", 100),
                        "summoner_name": p.get("riotIdGameName", ""),
                    }
                    break

        return pid_map

    def _get_player_pid(
        self, timeline: dict[str, Any], puuid: str,
    ) -> int:
        """Get the player's participant ID in the timeline."""
        for p in timeline.get("info", {}).get("participants", []):
            if p.get("puuid") == puuid:
                return p.get("participantId", 0)
        return 0

    def _extract_gold_diff(
        self,
        timeline: dict[str, Any],
        player_team_id: int,
        pid_map: dict[int, dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Extract gold difference per minute from timeline frames."""
        frames = timeline.get("info", {}).get("frames", [])
        result = []

        for i, frame in enumerate(frames):
            pf = frame.get("participantFrames", {})
            ally_gold = 0
            enemy_gold = 0

            for pid_str, data in pf.items():
                pid = int(pid_str)
                info = pid_map.get(pid, {})
                gold = data.get("totalGold", 0)

                if info.get("team_id") == player_team_id:
                    ally_gold += gold
                else:
                    enemy_gold += gold

            result.append({
                "minute": i,
                "gold_diff": ally_gold - enemy_gold,
            })

        return result

    def _extract_deaths(
        self,
        timeline: dict[str, Any],
        puuid: str,
        player_pid: int,
        pid_map: dict[int, dict[str, Any]],
        duration_min: float,
    ) -> list[dict[str, Any]]:
        """Extract player death events with context."""
        frames = timeline.get("info", {}).get("frames", [])
        deaths = []

        for frame in frames:
            for event in frame.get("events", []):
                if event.get("type") != "CHAMPION_KILL":
                    continue
                if event.get("victimId") != player_pid:
                    continue

                ts = event.get("timestamp", 0) // 1000  # ms -> sec
                minute = ts / 60

                # Game phase
                if minute < 15:
                    phase = "early"
                elif minute < 25:
                    phase = "mid"
                else:
                    phase = "late"

                killer_pid = event.get("killerId", 0)
                killer_info = pid_map.get(killer_pid, {})
                killer_name = killer_info.get("champion_name", "Desconhecido")

                assisting_pids = event.get("assistingParticipantIds", [])
                assisters = [
                    pid_map.get(a, {}).get("champion_name", "?")
                    for a in assisting_pids
                ]

                num_enemies = 1 + len(assisting_pids)
                pos = event.get("position", {})

                if num_enemies >= 3:
                    desc = f"Morto por {num_enemies} inimigos ({phase} game)"
                elif phase == "early":
                    desc = f"Morte no early game por {killer_name}"
                elif num_enemies == 1:
                    desc = f"Morto em 1v1 por {killer_name} ({phase} game)"
                else:
                    desc = f"Morto por {killer_name} + {len(assisters)} ({phase} game)"

                deaths.append({
                    "timestamp_sec": ts,
                    "game_phase": phase,
                    "position_x": pos.get("x", 0),
                    "position_y": pos.get("y", 0),
                    "killer": killer_name,
                    "assisters": assisters,
                    "num_enemies": num_enemies,
                    "description": desc,
                })

        return deaths

    def _extract_objectives(
        self,
        timeline: dict[str, Any],
        player_team_id: int,
        pid_map: dict[int, dict[str, Any]],
    ) -> tuple[list[dict], int, int, int, int, int, int, int, int]:
        """Extract objective events from timeline."""
        frames = timeline.get("info", {}).get("frames", [])
        objectives = []
        ally_d = enemy_d = ally_b = enemy_b = 0
        ally_h = enemy_h = ally_t = enemy_t = 0

        for frame in frames:
            for event in frame.get("events", []):
                etype = event.get("type", "")
                ts = event.get("timestamp", 0) // 1000

                if etype == "ELITE_MONSTER_KILL":
                    killer_pid = event.get("killerTeamId", 0)
                    # killerTeamId is 100 or 200 directly
                    is_ally = killer_pid == player_team_id
                    team = "ally" if is_ally else "enemy"
                    monster = event.get("monsterType", "")
                    subtype = event.get("monsterSubType", "")

                    if monster == "DRAGON":
                        obj_type = "dragon"
                        sub = subtype.replace("_DRAGON", "").lower() if subtype else "unknown"
                        if is_ally:
                            ally_d += 1
                        else:
                            enemy_d += 1
                    elif monster == "BARON_NASHOR":
                        obj_type = "baron"
                        sub = "baron"
                        if is_ally:
                            ally_b += 1
                        else:
                            enemy_b += 1
                    elif monster == "RIFTHERALD":
                        obj_type = "herald"
                        sub = "herald"
                        if is_ally:
                            ally_h += 1
                        else:
                            enemy_h += 1
                    else:
                        continue

                    objectives.append({
                        "timestamp_sec": ts,
                        "event_type": obj_type,
                        "team": team,
                        "subtype": sub,
                    })

                elif etype == "BUILDING_KILL":
                    building = event.get("buildingType", "")
                    if "TOWER" not in building and "INHIBITOR" not in building:
                        continue

                    team_id = event.get("teamId", 0)
                    # teamId in BUILDING_KILL = the team that LOST the building
                    is_ally_kill = team_id != player_team_id
                    team = "ally" if is_ally_kill else "enemy"
                    lane = event.get("laneType", "").lower()

                    if "TOWER" in building:
                        obj_type = "tower"
                        if is_ally_kill:
                            ally_t += 1
                        else:
                            enemy_t += 1
                    else:
                        obj_type = "inhibitor"

                    objectives.append({
                        "timestamp_sec": ts,
                        "event_type": obj_type,
                        "team": team,
                        "subtype": lane,
                    })

        # Sort by timestamp
        objectives.sort(key=lambda o: o["timestamp_sec"])

        return (
            objectives,
            ally_d, enemy_d,
            ally_b, enemy_b,
            ally_h, enemy_h,
            ally_t, enemy_t,
        )

    def _extract_phase_stats(
        self,
        timeline: dict[str, Any],
        player_pid: int,
        duration_min: float,
    ) -> list[dict[str, Any]]:
        """Extract player stats per game phase from timeline frames."""
        frames = timeline.get("info", {}).get("frames", [])
        if not frames or player_pid == 0:
            return []

        phases = [
            ("early", 0, 15),
            ("mid", 15, 25),
            ("late", 25, 999),
        ]

        result = []
        pid_key = str(player_pid)

        for phase_name, start_min, end_min in phases:
            if start_min >= duration_min:
                continue

            # Get frame at start and end of phase
            start_frame_idx = min(start_min, len(frames) - 1)
            end_frame_idx = min(int(min(end_min, duration_min)), len(frames) - 1)

            if start_frame_idx >= len(frames) or end_frame_idx >= len(frames):
                continue

            start_data = frames[start_frame_idx].get("participantFrames", {}).get(pid_key, {})
            end_data = frames[end_frame_idx].get("participantFrames", {}).get(pid_key, {})

            phase_duration = min(end_min, duration_min) - start_min
            if phase_duration <= 0:
                continue

            cs_start = start_data.get("minionsKilled", 0) + start_data.get("jungleMinionsKilled", 0)
            cs_end = end_data.get("minionsKilled", 0) + end_data.get("jungleMinionsKilled", 0)
            cs_diff = cs_end - cs_start

            gold_start = start_data.get("totalGold", 0)
            gold_end = end_data.get("totalGold", 0)
            gold_diff = gold_end - gold_start

            # Count kills/deaths/assists in this phase from events
            kills = deaths = assists = 0
            for frame in frames[start_frame_idx:end_frame_idx + 1]:
                for event in frame.get("events", []):
                    if event.get("type") != "CHAMPION_KILL":
                        continue
                    if event.get("killerId") == player_pid:
                        kills += 1
                    if event.get("victimId") == player_pid:
                        deaths += 1
                    if player_pid in event.get("assistingParticipantIds", []):
                        assists += 1

            result.append({
                "phase": phase_name,
                "kills": kills,
                "deaths": deaths,
                "assists": assists,
                "cs": cs_diff,
                "cs_per_min": round(cs_diff / max(phase_duration, 1), 1),
                "gold": gold_diff,
                "gold_per_min": round(gold_diff / max(phase_duration, 1), 0),
            })

        return result

    def _generate_improvements(
        self,
        player: dict[str, Any],
        bench: EloBenchmark,
        tier: str,
        deaths: list[dict[str, Any]],
        ally_dragons: int,
        enemy_dragons: int,
        ally_barons: int,
        enemy_barons: int,
        duration_min: float,
    ) -> list[dict[str, Any]]:
        """Generate specific improvement points for this match."""
        points: list[dict[str, Any]] = []

        # 1. Early deaths
        early_deaths = [d for d in deaths if d["game_phase"] == "early"]
        if len(early_deaths) >= 2:
            points.append({
                "category": "deaths",
                "severity": "critical",
                "title": "Muitas mortes no early game",
                "description": (
                    f"Voce morreu {len(early_deaths)}x antes dos 15 minutos. "
                    "Mortes no early game dao vantagem exponencial ao inimigo."
                ),
                "recommendation": (
                    "Respeite mais o power spike do oponente. Jogue defensivo "
                    "ate entender o matchup. Use wards nos pontos de gank "
                    "entre 3-6 minutos."
                ),
            })

        # 2. Total deaths vs benchmark
        if player["deaths"] > bench.deaths_per_game * 1.3:
            excess = round(
                (player["deaths"] / max(bench.deaths_per_game, 1) - 1) * 100
            )
            points.append({
                "category": "deaths",
                "severity": "critical" if player["deaths"] > bench.deaths_per_game * 1.5 else "important",
                "title": "Mortes acima da media do elo",
                "description": (
                    f"Voce morreu {player['deaths']}x nesta partida "
                    f"({excess}% acima da media de {tier}: "
                    f"{bench.deaths_per_game:.1f})."
                ),
                "recommendation": (
                    "Revise as mortes no replay. Identifique se foram "
                    "por posicionamento, trades errados ou falta de visao."
                ),
            })

        # 3. CS below benchmark
        cs_ratio = player["cs_per_min"] / max(bench.cs_per_min, 0.01)
        if cs_ratio < 0.85:
            deficit = round((1 - cs_ratio) * 100)
            points.append({
                "category": "farming",
                "severity": "critical" if cs_ratio < 0.7 else "important",
                "title": "Farm abaixo da media",
                "description": (
                    f"Seu CS/min ({player['cs_per_min']}) esta {deficit}% "
                    f"abaixo da media de {tier} ({bench.cs_per_min:.1f})."
                ),
                "recommendation": (
                    "Foque em nao perder CS durante roams. "
                    "Pratique last hit e lembre de pegar waves laterais "
                    "no mid/late game."
                ),
            })

        # 4. Vision
        vision_ratio = player["vision_per_min"] / max(bench.vision_per_min, 0.01)
        if vision_ratio < 0.75:
            points.append({
                "category": "vision",
                "severity": "important",
                "title": "Visao insuficiente nesta partida",
                "description": (
                    f"Seu vision score/min ({player['vision_per_min']:.2f}) "
                    f"esta abaixo da meta de {tier} "
                    f"({bench.vision_per_min:.2f}). Voce colocou "
                    f"{player['wards_placed']} wards em "
                    f"{duration_min:.0f} minutos."
                ),
                "recommendation": (
                    "Compre Control Ward toda vez que voltar a base. "
                    "Use trinket no cooldown. Foque em visao de objetivos "
                    "antes de Dragon e Baron."
                ),
            })

        # 5. Objective control
        if enemy_dragons >= 3 and ally_dragons <= 1:
            points.append({
                "category": "objectives",
                "severity": "important",
                "title": "Controle de dragoes perdido",
                "description": (
                    f"O time inimigo pegou {enemy_dragons} dragoes "
                    f"enquanto seu time pegou apenas {ally_dragons}. "
                    "Dragoes dao vantagens permanentes."
                ),
                "recommendation": (
                    "Priorize rotacoes para dragon. Coloque visao 1 minuto "
                    "antes do spawn. Puxe waves bot/mid antes de contestar."
                ),
            })

        if enemy_barons >= 1 and ally_barons == 0:
            points.append({
                "category": "objectives",
                "severity": "critical",
                "title": "Baron perdido para o inimigo",
                "description": (
                    f"O inimigo pegou {enemy_barons} Baron(s). "
                    "Baron da vantagem enorme em push e stats."
                ),
                "recommendation": (
                    "Mantenha visao no baron pit apos 20 minutos. "
                    "Nunca deixe o inimigo fazer baron de graca. "
                    "Se nao pode contestar, troque por objetivo (torre, dragon)."
                ),
            })

        # 6. Damage output
        dmg_ratio = player["damage_per_min"] / max(bench.damage_per_min, 1)
        if dmg_ratio < 0.7:
            points.append({
                "category": "fighting",
                "severity": "important",
                "title": "Dano abaixo do esperado",
                "description": (
                    f"Seu DPM ({player['damage_per_min']:.0f}) esta muito "
                    f"abaixo da media de {tier} ({bench.damage_per_min:.0f})."
                ),
                "recommendation": (
                    "Participe mais de trades e teamfights. "
                    "Verifique se sua build esta correta para o matchup."
                ),
            })

        # 7. Deaths by multiple enemies (positioning)
        multi_enemy_deaths = [d for d in deaths if d.get("num_enemies", 1) >= 3]
        if len(multi_enemy_deaths) >= 2:
            points.append({
                "category": "positioning",
                "severity": "important",
                "title": "Mortes por posicionamento",
                "description": (
                    f"Voce morreu {len(multi_enemy_deaths)}x para 3+ inimigos. "
                    "Isso indica que voce estava fora de posicao ou sem o time."
                ),
                "recommendation": (
                    "Evite facecheck em areas sem visao. "
                    "Fique proximo do seu time em teamfights. "
                    "No late game, nunca ande sozinho pelo mapa."
                ),
            })

        # Sort by severity
        sev_order = {"critical": 0, "important": 1, "minor": 2}
        points.sort(key=lambda p: sev_order.get(p["severity"], 9))

        return points

    def _calculate_grade(
        self,
        player: dict[str, Any],
        bench: EloBenchmark,
    ) -> str:
        """Calculate a performance grade (S+ to D) based on benchmark comparison."""
        scores = []

        # KDA score
        kda = (player["kills"] + player["assists"]) / max(player["deaths"], 1)
        kda_score = min(kda / max(bench.kda, 1) * 100, 150)
        scores.append(kda_score)

        # CS score
        cs_score = min(player["cs_per_min"] / max(bench.cs_per_min, 1) * 100, 150)
        scores.append(cs_score)

        # Damage score
        dmg_score = min(player["damage_per_min"] / max(bench.damage_per_min, 1) * 100, 150)
        scores.append(dmg_score)

        # Vision score
        vis_score = min(player["vision_per_min"] / max(bench.vision_per_min, 0.01) * 100, 150)
        scores.append(vis_score)

        # KP score
        kp_score = min(player["kill_participation"] / max(bench.kill_participation * 100, 1) * 100, 150)
        scores.append(kp_score)

        avg = sum(scores) / len(scores)

        if avg >= 130:
            return "S+"
        if avg >= 115:
            return "S"
        if avg >= 105:
            return "A+"
        if avg >= 95:
            return "A"
        if avg >= 85:
            return "B+"
        if avg >= 75:
            return "B"
        if avg >= 65:
            return "C+"
        if avg >= 55:
            return "C"
        if avg >= 45:
            return "D+"
        return "D"
