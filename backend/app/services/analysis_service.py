"""Analysis orchestration service.

Combines stats extraction, performance scoring, diagnostics,
champion analysis, and trends into a single response.
"""

from typing import Any

from app.analysis.champions import (
    analyze_champions,
    get_best_champions,
    identify_mains,
    suggest_champion_pool,
)
from app.analysis.diagnostics import run_diagnostics
from app.analysis.performance import analyze_performance
from app.analysis.stats_extractor import aggregate_stats
from app.analysis.trends import analyze_trends
from app.config import settings
from app.services.cache_service import CacheService


class AnalysisService:
    """Full analysis pipeline from raw matches to insights."""

    def __init__(self, cache: CacheService) -> None:
        self._cache = cache

    async def full_analysis(
        self,
        matches: list[dict[str, Any]],
        puuid: str,
        tier: str,
        role_override: str = "",
    ) -> dict[str, Any]:
        """Run complete analysis pipeline.

        If role_override is set, benchmarks use that role instead of auto-detected.
        """
        cache_key = CacheService.key(
            "analysis", puuid, str(len(matches)), role_override,
        )
        cached = await self._cache.get(cache_key)
        if cached:
            return cached

        # 1. Aggregate raw stats (includes primary role detection)
        stats = aggregate_stats(matches, puuid)
        role = role_override or stats.primary_role

        # 2. Performance scoring (role-aware benchmarks)
        performance = analyze_performance(stats, tier, role)

        # 3. Diagnostics (role-aware benchmarks)
        diagnostics = run_diagnostics(stats, tier, role)

        # 4. Champion analysis
        champions = analyze_champions(stats.per_match)
        best = get_best_champions(stats.per_match)
        mains = identify_mains(stats.per_match)
        pool_suggestion = suggest_champion_pool(champions)

        # 5. Trends
        trends = analyze_trends(stats.per_match)

        result = {
            "games_analyzed": stats.games_analyzed,
            "wins": stats.wins,
            "losses": stats.losses,
            "primary_role": role,
            "win_rate": (
                round(stats.wins / stats.games_analyzed * 100, 1)
                if stats.games_analyzed else 0.0
            ),
            "performance": {
                "overall_score": performance.overall_score,
                "dimensions": [
                    {
                        "name": d.name,
                        "score": round(d.score, 1),
                        "raw_value": d.raw_value,
                        "benchmark": d.benchmark,
                        "percentile": round(d.percentile, 1),
                    }
                    for d in performance.dimensions
                ],
                "strengths": performance.strengths,
                "weaknesses": performance.weaknesses,
            },
            "diagnostics": [
                {
                    "category": d.category,
                    "severity": d.severity,
                    "title": d.title,
                    "description": d.description,
                    "recommendation": d.recommendation,
                    "data": d.data,
                }
                for d in diagnostics
            ],
            "best_champions": [
                {
                    "champion_name": c.champion_name,
                    "games": c.games,
                    "win_rate": round(c.win_rate * 100, 1),
                    "avg_kda": c.avg_kda,
                    "avg_cs_per_min": c.avg_cs_per_min,
                    "positions": c.positions,
                }
                for c in best
            ],
            "mains": mains,
            "champion_pool": pool_suggestion,
            "trends": [
                {
                    "metric": t.metric,
                    "trend": t.trend,
                    "early_avg": t.early_avg,
                    "recent_avg": t.recent_avg,
                    "change_pct": t.change_pct,
                }
                for t in trends
            ],
        }

        await self._cache.set(cache_key, result, settings.CACHE_TTL_ANALYSIS)
        return result
