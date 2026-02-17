"""Tests for performance scoring engine."""

from app.analysis.performance import analyze_performance
from app.analysis.stats_extractor import AggregatedStats


class TestPerformanceAnalyzer:
    def test_returns_profile_with_dimensions(self):
        stats = AggregatedStats(
            games_analyzed=10,
            wins=6,
            losses=4,
            avg_kills=7.0,
            avg_deaths=4.0,
            avg_assists=8.0,
            avg_kda=3.75,
            avg_cs_per_min=6.5,
            avg_vision_per_min=0.7,
            avg_damage_per_min=550,
            avg_gold_per_min=400,
            avg_kill_participation=0.55,
            avg_wards_per_game=7.0,
            kda_stddev=0.8,
        )

        profile = analyze_performance(stats, "GOLD")

        assert 0 <= profile.overall_score <= 100
        assert len(profile.dimensions) == 7
        assert all(0 <= d.score <= 100 for d in profile.dimensions)

    def test_strengths_and_weaknesses_classified(self):
        stats = AggregatedStats(
            games_analyzed=20,
            wins=14,
            losses=6,
            avg_kills=9.0,
            avg_deaths=2.5,
            avg_assists=10.0,
            avg_kda=7.6,
            avg_cs_per_min=8.0,
            avg_vision_per_min=0.3,  # Low vision
            avg_damage_per_min=700,
            avg_gold_per_min=480,
            avg_kill_participation=0.65,
            avg_wards_per_game=4.0,
            kda_stddev=0.5,
        )

        profile = analyze_performance(stats, "GOLD")

        assert "fighting" in profile.strengths
        assert "vision" in profile.weaknesses
