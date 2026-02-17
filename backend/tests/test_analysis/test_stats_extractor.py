"""Tests for stats extraction from match data."""

from app.analysis.stats_extractor import (
    aggregate_stats,
    extract_match_stats,
    find_participant,
)


class TestFindParticipant:
    def test_finds_existing_participant(self, sample_match_data):
        result = find_participant(sample_match_data, "puuid-test-1")
        assert result is not None
        assert result["championName"] == "Jinx"

    def test_returns_none_for_missing_puuid(self, sample_match_data):
        result = find_participant(sample_match_data, "nonexistent")
        assert result is None


class TestExtractMatchStats:
    def test_extracts_stats_correctly(self, sample_match_data):
        stats = extract_match_stats(sample_match_data, "puuid-test-1")
        assert stats is not None
        assert stats.champion_name == "Jinx"
        assert stats.win is True
        assert stats.kills == 8
        assert stats.deaths == 3
        assert stats.assists == 12
        assert 6.5 < stats.cs_per_min < 7.0  # (180+20)/30

    def test_skips_short_games(self, sample_match_data):
        sample_match_data["info"]["gameDuration"] = 200  # < 300s
        stats = extract_match_stats(sample_match_data, "puuid-test-1")
        assert stats is None

    def test_returns_none_for_missing_player(self, sample_match_data):
        stats = extract_match_stats(sample_match_data, "wrong-puuid")
        assert stats is None


class TestAggregateStats:
    def test_aggregates_single_match(self, sample_match_data):
        result = aggregate_stats([sample_match_data], "puuid-test-1")
        assert result.games_analyzed == 1
        assert result.wins == 1
        assert result.avg_kills == 8.0
        assert result.avg_deaths == 3.0

    def test_empty_matches_returns_empty(self):
        result = aggregate_stats([], "puuid-test-1")
        assert result.games_analyzed == 0
