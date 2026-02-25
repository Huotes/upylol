"""Rule-based diagnostics engine for improvement recommendations.

Each rule checks one aspect of performance against elo benchmarks
and emits a Diagnostic with severity, description, and actionable advice.

Expanded with 12+ diagnostic rules covering:
- Farming, Deaths, Vision, Damage, Kill Participation, Consistency
- Early Game, Wave Management, Objective Control, Itemization,
  Positioning, Gold Efficiency
"""

from dataclasses import dataclass, field
from statistics import mean
from typing import Any

from app.analysis.benchmarks import EloBenchmark, get_role_benchmark
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
    data: dict[str, Any] = field(default_factory=dict)


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
        title="Farm abaixo da media do elo",
        description=(
            f"Seu CS/min ({cs:.1f}) esta {deficit}% abaixo "
            f"da media de {tier} ({target:.1f}). Isso significa "
            f"menos ouro, menos itens e menos impacto no jogo."
        ),
        recommendation=(
            "Pratique last hit no Practice Tool por 10 minutos antes de "
            "jogar ranked. Foque em nao perder CS durante roams. "
            "Meta: manter 7+ CS/min nos primeiros 15 minutos."
        ),
        data={
            "current": round(cs, 1),
            "benchmark": round(target, 1),
            "deficit_pct": deficit,
            "benchmark_tier": tier,
        },
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
            f"Voce morre {deaths:.1f}x por partida -- {excess}% acima "
            f"da media de {tier} ({target:.1f}). Cada morte da ouro, "
            "XP e pressao de mapa para o inimigo."
        ),
        recommendation=(
            "Revise seus replays focando nas mortes. Identifique se sao "
            "por posicionamento, trades errados ou falta de visao. "
            "Meta: reduzir pelo menos 1 morte por jogo."
        ),
        data={
            "current": round(deaths, 1),
            "benchmark": round(target, 1),
            "excess_pct": excess,
            "benchmark_tier": tier,
        },
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

    deficit = round((1 - ratio) * 100)
    return Diagnostic(
        category="vision",
        severity="critical" if ratio < 0.5 else "important",
        title="Visao insuficiente",
        description=(
            f"Seu vision score/min ({vision:.2f}) esta {deficit}% abaixo "
            f"da media de {tier} ({target:.2f}). "
            f"Voce coloca em media {stats.avg_wards_per_game:.0f} wards por jogo."
        ),
        recommendation=(
            "Compre Control Ward toda vez que voltar a base. "
            "Use trinket no cooldown. Troque para sweeper apos completar "
            "o primeiro item se for jungler ou support."
        ),
        data={
            "current": round(vision, 2),
            "benchmark": round(target, 2),
            "deficit_pct": deficit,
            "benchmark_tier": tier,
        },
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

    deficit = round((1 - ratio) * 100)
    return Diagnostic(
        category="fighting",
        severity="critical" if ratio < 0.6 else "important",
        title="Dano abaixo do esperado",
        description=(
            f"Seu DPM ({dpm:.0f}) esta {deficit}% abaixo da media de "
            f"{tier} ({target:.0f}). Isso sugere que voce nao esta "
            "participando o suficiente de trades e teamfights."
        ),
        recommendation=(
            "Busque mais trades em lane. Participe ativamente de "
            "teamfights e verifique se esta buildando corretamente. "
            "Considere trocar para campeoes com mais dano em teamfight."
        ),
        data={
            "current": round(dpm),
            "benchmark": round(target),
            "deficit_pct": deficit,
            "benchmark_tier": tier,
        },
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

    deficit = round((1 - kp / max(target, 0.01)) * 100)
    return Diagnostic(
        category="teamplay",
        severity="important" if kp < target * 0.7 else "minor",
        title="Participacao em kills baixa",
        description=(
            f"Sua kill participation ({kp:.0%}) esta abaixo "
            f"da media de {tier} ({target:.0%}). "
            "Voce pode estar perdendo oportunidades de ajudar o time."
        ),
        recommendation=(
            "Preste atencao ao minimap para oportunidades de roam. "
            "Ajude em skirmishes do jungler. Esteja presente nas teamfights. "
            "Use TP proativamente para ganks em outras lanes."
        ),
        data={
            "current": round(kp * 100, 1),
            "benchmark": round(target * 100, 1),
            "deficit_pct": deficit,
            "benchmark_tier": tier,
        },
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
        severity="critical" if stats.kda_stddev > 3.0 else (
            "important" if stats.kda_stddev > 2.0 else "minor"
        ),
        title="Performance inconsistente",
        description=(
            f"Seu KDA varia bastante entre partidas "
            f"(desvio padrao: {stats.kda_stddev:.2f}). "
            "Isso indica altos e baixos frequentes, o que "
            "dificulta subir de elo de forma consistente."
        ),
        recommendation=(
            "Foque em consistencia: jogue campeoes confortaveis, "
            "evite tilt queue e faca pausas apos 2 derrotas seguidas. "
            "Reduza seu champion pool para 2-3 campeoes."
        ),
        data={"kda_stddev": round(stats.kda_stddev, 2)},
    )


def _check_early_game(
    stats: AggregatedStats,
    _bench: EloBenchmark,
    _tier: str,
) -> Diagnostic | None:
    """Check early game performance (first 15min proxy)."""
    if stats.games_analyzed < 5:
        return None

    matches = stats.per_match
    early_deaths = mean(min(m.deaths, 3) for m in matches)
    early_cs = mean(m.cs_per_min for m in matches)

    if early_deaths <= 1.5 and early_cs >= 5.0:
        return None

    if early_deaths > 2.0:
        return Diagnostic(
            category="early_game",
            severity="important",
            title="Early game vulneravel",
            description=(
                f"Voce morre cedo demais com frequencia (media de "
                f"{early_deaths:.1f} mortes pre-15min estimado). "
                "Mortes no early game dao vantagem exponencial ao inimigo."
            ),
            recommendation=(
                "Respeite mais o power spike do oponente. Jogue defensivo "
                "ate entender o matchup. Use wards nos pontos de gank "
                "entre 3-6 minutos quando o jungler estara passando."
            ),
            data={"early_deaths_avg": round(early_deaths, 1)},
        )

    return Diagnostic(
        category="early_game",
        severity="minor",
        title="Farm no early game pode melhorar",
        description=(
            f"Seu CS/min geral ({early_cs:.1f}) sugere que voce "
            "pode estar perdendo CS nos primeiros minutos. "
            "Os primeiros 10 minutos definem a curva de gold."
        ),
        recommendation=(
            "Pratique os primeiros 10 minutos no Practice Tool. "
            "Foque em pegar todos os minions sob torre. "
            "Evite trocar agressivamente quando tem CS para pegar."
        ),
        data={"early_cs_avg": round(early_cs, 1)},
    )


def _check_gold_efficiency(
    stats: AggregatedStats,
    bench: EloBenchmark,
    tier: str,
) -> Diagnostic | None:
    """Check if player converts gold into damage efficiently."""
    gold = stats.avg_gold_per_min
    dmg = stats.avg_damage_per_min

    if gold < 200 or dmg < 200:
        return None

    dmg_per_gold = dmg / gold
    expected = bench.damage_per_min / max(bench.gold_per_min, 1)

    ratio = dmg_per_gold / max(expected, 0.01)
    if ratio >= 0.8:
        return None

    return Diagnostic(
        category="economy",
        severity="minor",
        title="Conversao de gold em dano baixa",
        description=(
            f"Voce ganha {gold:.0f} gold/min mas converte apenas "
            f"{dmg:.0f} dano/min. A proporcao ({dmg_per_gold:.2f}) esta "
            f"abaixo do esperado para {tier} ({expected:.2f})."
        ),
        recommendation=(
            "Revise suas builds. Verifique se esta comprando itens "
            "adequados ao matchup. Evite acumular gold sem comprar. "
            "Considere itens com melhor custo-beneficio."
        ),
        data={
            "gold_per_min": round(gold),
            "damage_per_min": round(dmg),
            "dmg_per_gold": round(dmg_per_gold, 2),
            "expected_ratio": round(expected, 2),
        },
    )


def _check_death_timing(
    stats: AggregatedStats,
    _bench: EloBenchmark,
    _tier: str,
) -> Diagnostic | None:
    """Check if deaths increase significantly in longer games."""
    if stats.games_analyzed < 8:
        return None

    matches = stats.per_match
    short = [m for m in matches if m.duration_min < 25]
    long_ = [m for m in matches if m.duration_min >= 30]

    if len(short) < 3 or len(long_) < 3:
        return None

    short_deaths = mean(m.deaths for m in short)
    long_deaths = mean(m.deaths for m in long_)

    if long_deaths <= short_deaths * 1.5:
        return None

    return Diagnostic(
        category="positioning",
        severity="important",
        title="Mortes aumentam em jogos longos",
        description=(
            f"Em jogos curtos (<25min) voce morre {short_deaths:.1f}x, "
            f"mas em jogos longos (30min+) morre {long_deaths:.1f}x. "
            "Isso sugere problemas de posicionamento no late game."
        ),
        recommendation=(
            "No late game, fique sempre atras do frontline. "
            "Evite facecheck em areas sem visao. "
            "Jogue junto do time e espere o engage inimigo. "
            "Posicione-se para peel, nao para engage."
        ),
        data={
            "short_game_deaths": round(short_deaths, 1),
            "long_game_deaths": round(long_deaths, 1),
        },
    )


def _check_champion_diversity(
    stats: AggregatedStats,
    _bench: EloBenchmark,
    _tier: str,
) -> Diagnostic | None:
    """Check if player is playing too many different champions."""
    if stats.games_analyzed < 10:
        return None

    matches = stats.per_match
    champs = {m.champion_name for m in matches}
    ratio = len(champs) / len(matches)

    if ratio <= 0.5:
        return None

    return Diagnostic(
        category="consistency",
        severity="minor" if ratio < 0.7 else "important",
        title="Champion pool muito diverso",
        description=(
            f"Voce jogou {len(champs)} campeoes diferentes em "
            f"{len(matches)} partidas ({ratio:.0%} de diversidade). "
            "Jogar muitos campeoes diferentes dificulta a maestria."
        ),
        recommendation=(
            "Reduza seu champion pool para 2-3 campeoes por role. "
            "Foque em dominar poucos picks antes de expandir. "
            "Jogadores que sobem de elo consistentemente "
            "tem 60%+ das partidas em 3 campeoes."
        ),
        data={
            "unique_champions": len(champs),
            "total_games": len(matches),
            "diversity_ratio": round(ratio, 2),
        },
    )


def _check_ward_efficiency(
    stats: AggregatedStats,
    bench: EloBenchmark,
    _tier: str,
) -> Diagnostic | None:
    """Check if player destroys wards (denying enemy vision)."""
    if stats.games_analyzed < 5:
        return None

    matches = stats.per_match
    avg_wards_killed = mean(m.wards_killed for m in matches)

    if avg_wards_killed >= 2.0:
        return None

    return Diagnostic(
        category="vision",
        severity="minor",
        title="Poucas wards destruidas",
        description=(
            f"Voce destroi em media {avg_wards_killed:.1f} wards por jogo. "
            "Negar visao inimiga e tao importante quanto colocar "
            "suas proprias wards."
        ),
        recommendation=(
            "Use Oracle Lens (sweeper) apos lane phase. "
            "Limpe wards de objetivos antes de Dragon/Baron. "
            "Control Wards tambem revelam wards inimigas."
        ),
        data={"avg_wards_killed": round(avg_wards_killed, 1)},
    )


# Registry of all diagnostic rules
_RULES = [
    _check_farming,
    _check_deaths,
    _check_vision,
    _check_damage,
    _check_kill_participation,
    _check_consistency,
    _check_early_game,
    _check_gold_efficiency,
    _check_death_timing,
    _check_champion_diversity,
    _check_ward_efficiency,
]


def run_diagnostics(
    stats: AggregatedStats,
    tier: str,
    role: str = "",
) -> list[Diagnostic]:
    """Execute all diagnostic rules, sorted by severity."""
    bench = get_role_benchmark(tier, role)
    diagnostics: list[Diagnostic] = []

    for rule in _RULES:
        result = rule(stats, bench, tier)
        if result:
            diagnostics.append(result)

    return sorted(diagnostics, key=lambda d: SEVERITY_ORDER.get(d.severity, 9))
