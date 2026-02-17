"""Tests for rate limiter."""

import asyncio

import pytest

from app.riot.rate_limiter import RateLimiter


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_acquire_succeeds(self):
        limiter = RateLimiter(burst_limit=10, spread_limit=50)
        await limiter.acquire("br1")  # Should not raise

    @pytest.mark.asyncio
    async def test_creates_independent_region_buckets(self):
        limiter = RateLimiter(burst_limit=2, spread_limit=10)

        await limiter.acquire("br1")
        await limiter.acquire("na1")

        assert "br1" in limiter._buckets
        assert "na1" in limiter._buckets

    def test_update_limits_from_header(self):
        limiter = RateLimiter()
        limiter.update_limits("br1", "100:1,1000:120")

        buckets = limiter._get_buckets("br1")
        assert len(buckets) == 2
        # 10% safety margin applied
        assert buckets[0].max_tokens == 90
        assert buckets[1].max_tokens == 900
