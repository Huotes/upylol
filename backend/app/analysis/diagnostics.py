"""Rule-based diagnostics engine for improvement recommendations.

Each rule checks one aspect of performance against elo benchmarks
and emits a Diagnostic with severity, description, and actionable advice.
"""

from dataclasses import dataclass
from typing import Any

from app.analysis.benchmarks import EloBenchmark, get_benchmark
from app.analysis.stats_extractor import AggregatedStats

Severity = str  # "critical" | "important" | "minor"


@dataclass(frozen=True)
class Diagnostic:
    """Single diagnostic finding with actionable recommendation."""

    category: str
    severity: Severity
    title: str
    description: str
    recommendation: str
    data: dict[str, Any]


SEVERITY_ORDER = {"critical": 0, "important": 1, "minor": 2}


def _check_farming(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    cs = stats.avg_cs_per_min
    target = bench.cs_per_min
    ratio = cs / max(target, 0.01)

    if ratio >= 0.85:
        return None

    deficit = round((1 - ratio) * 100)
    return Diagnostic(
        category="farming",
        severity="critical" if ratio < 0.7 else "important",
        title="Farm abaixo da média do elo",
        description=(
            f"Seu CS/min ({cs:.1f}) está {deficit}% abaixo "
            f"da média de {tier} ({target:.1f})."
        ),
        recommendation=(
            "Pratique last hit no Practice Tool por 10 minutos antes de "
            "jogar ranked. Foque em não perder CS durante roams e "
            "tente manter 7+ CS/min como meta."
        ),
        data={"current": cs, "benchmark": target, "deficit_pct": deficit},
    )


def _check_deaths(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    deaths = stats.avg_deaths
    target = bench.deaths_per_game
    ratio = deaths / max(target, 0.01)

    if ratio <= 1.2:
        return None

    excess = round((ratio - 1) * 100)
    return Diagnostic(
        category="survivability",
        severity="critical" if ratio > 1.5 else "important",
        title="Morrendo demais",
        description=(
            f"Você morre {deaths:.1f}x por partida — {excess}% acima "
            f"da média de {tier} ({target:.1f})."
        ),
        recommendation=(
            "Revise seus replays focando nas mortes. Identifique se são "
            "por posicionamento, trades errados ou falta de visão. "
            "Meta: reduzir pelo menos 1 morte por jogo."
        ),
        data={"current": deaths, "benchmark": target, "excess_pct": excess},
    )


def _check_vision(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    vision = stats.avg_vision_per_min
    target = bench.vision_per_min
    ratio = vision / max(target, 0.01)

    if ratio >= 0.75:
        return None

    return Diagnostic(
        category="vision",
        severity="important",
        title="Visão insuficiente",
        description=(
            f"Seu vision score/min ({vision:.2f}) está abaixo "
            f"da média de {tier} ({target:.2f})."
        ),
        recommendation=(
            "Compre Control Ward toda vez que voltar à base. "
            "Use trinket no cooldown. Destrua wards inimigas com sweeper."
        ),
        data={"current": vision, "benchmark": target},
    )


def _check_damage(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    dpm = stats.avg_damage_per_min
    target = bench.damage_per_min
    ratio = dpm / max(target, 0.01)

    if ratio >= 0.8:
        return None

    return Diagnostic(
        category="fighting",
        severity="important",
        title="Dano abaixo do esperado",
        description=(
            f"Seu DPM ({dpm:.0f}) está abaixo da média de "
            f"{tier} ({target:.0f})."
        ),
        recommendation=(
            "Busque mais trades em lane. Participe ativamente de "
            "teamfights e verifique se está buildando corretamente."
        ),
        data={"current": dpm, "benchmark": target},
    )


def _check_kill_participation(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    kp = stats.avg_kill_participation
    target = bench.kill_participation

    if kp >= target * 0.85:
        return None

    return Diagnostic(
        category="teamplay",
        severity="minor",
        title="Participação em kills baixa",
        description=(
            f"Sua kill participation ({kp:.0%}) está abaixo "
            f"da média de {tier} ({target:.0%})."
        ),
        recommendation=(
            "Preste atenção ao minimap para oportunidades de roam. "
            "Ajude em skirmishes do jungler. Esteja presente nas teamfights."
        ),
        data={"current": kp, "benchmark": target},
    )


def _check_consistency(
    stats: AggregatedStats,
    _bench: EloBenchmark,
    _tier: str,
) -> Diagnostic | None:
    if stats.games_analyzed < 5 or stats.kda_stddev < 1.5:
        return None

    return Diagnostic(
        category="consistency",
        severity="important" if stats.kda_stddev > 2.0 else "minor",
        title="Performance inconsistente",
        description=(
            f"Seu KDA varia bastante entre partidas "
            f"(desvio padrão: {stats.kda_stddev:.2f}). "
            "Isso indica altos e baixos frequentes."
        ),
        recommendation=(
            "Foque em consistência: jogue campeões confortáveis, "
            "evite tilt queue e faça pausas após 2 derrotas seguidas."
        ),
        data={"kda_stddev": stats.kda_stddev},
    )


# Registry of all diagnostic rules
_RULES = [
    _check_farming,
    _check_deaths,
    _check_vision,
    _check_damage,
    _check_kill_participation,
    _check_consistency,
]


def run_diagnostics(
    stats: AggregatedStats,
    tier: str,
) -> list[Diagnostic]:
    """Execute all diagnostic rules, sorted by severity."""
    bench = get_benchmark(tier)
    diagnostics: list[Diagnostic] = []

    for rule in _RULES:
        result = rule(stats, bench, tier)
        if result:
            diagnostics.append(result)

    return sorted(diagnostics, key=lambda d: SEVERITY_ORDER.get(d.severity, 9))
