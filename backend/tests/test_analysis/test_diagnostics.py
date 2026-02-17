"""Tests for diagnostics engine."""

from app.analysis.diagnostics import run_diagnostics
from app.analysis.stats_extractor import AggregatedStats


class TestDiagnostics:
    def test_detects_low_farming(self):
        stats = AggregatedStats(
            games_analyzed=10,
            avg_cs_per_min=3.5,  # Very low
            avg_deaths=5.0,
            avg_vision_per_min=0.7,
            avg_damage_per_min=520,
            avg_kill_participation=0.55,
            avg_kda=2.5,
            kda_stddev=0.8,
        )

        diagnostics = run_diagnostics(stats, "GOLD")
        categories = [d.category for d in diagnostics]

        assert "farming" in categories

    def test_detects_high_deaths(self):
        stats = AggregatedStats(
            games_analyzed=10,
            avg_cs_per_min=6.0,
            avg_deaths=9.5,  # Very high
            avg_vision_per_min=0.7,
            avg_damage_per_min=520,
            avg_kill_participation=0.55,
            avg_kda=1.5,
            kda_stddev=0.8,
        )

        diagnostics = run_diagnostics(stats, "GOLD")
        categories = [d.category for d in diagnostics]

        assert "survivability" in categories

    def test_no_diagnostics_for_good_stats(self):
        stats = AggregatedStats(
            games_analyzed=10,
            avg_cs_per_min=7.0,
            avg_deaths=4.0,
            avg_vision_per_min=0.9,
            avg_damage_per_min=650,
            avg_kill_participation=0.60,
            avg_kda=3.5,
            kda_stddev=0.5,
        )

        diagnostics = run_diagnostics(stats, "GOLD")

        # Good stats should produce few or no diagnostics
        assert len(diagnostics) <= 1

    def test_diagnostics_sorted_by_severity(self):
        stats = AggregatedStats(
            games_analyzed=10,
            avg_cs_per_min=2.5,  # critical
            avg_deaths=10.0,    # critical
            avg_vision_per_min=0.2,
            avg_damage_per_min=300,
            avg_kill_participation=0.30,
            avg_kda=1.0,
            kda_stddev=2.5,
        )

        diagnostics = run_diagnostics(stats, "GOLD")

        if len(diagnostics) >= 2:
            severities = [d.severity for d in diagnostics]
            severity_order = {"critical": 0, "important": 1, "minor": 2}
            ordered = sorted(severities, key=lambda s: severity_order.get(s, 9))
            assert severities == ordered
