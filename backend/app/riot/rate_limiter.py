"""Token bucket rate limiter compliant with Riot API limits.

Riot enforces per-region app limits (20/1s, 100/2min for dev keys)
and per-method limits. This implements the app-level limiter using
hierarchical buckets per region, with a safety margin.

References:
    - https://developer.riotgames.com/docs/portal (Rate Limiting)
    - Riot uses a leaky-bucket-like algorithm internally (ESRL)
"""

import asyncio
import time
from dataclasses import dataclass, field


@dataclass
class _Bucket:
    """Single token bucket with automatic refill."""

    max_tokens: int
    interval: float  # seconds
    _tokens: float = field(init=False)
    _last_refill: float = field(init=False)

    def __post_init__(self) -> None:
        self._tokens = float(self.max_tokens)
        self._last_refill = time.monotonic()

    def _refill(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_refill
        added = elapsed * (self.max_tokens / self.interval)
        self._tokens = min(self.max_tokens, self._tokens + added)
        self._last_refill = now

    async def acquire(self) -> None:
        """Block until a token is available, then consume it."""
        while True:
            self._refill()
            if self._tokens >= 1.0:
                self._tokens -= 1.0
                return
            wait = (1.0 - self._tokens) * (self.interval / self.max_tokens)
            await asyncio.sleep(wait)


class RateLimiter:
    """Multi-bucket rate limiter matching Riot API dev key limits.

    Each region gets independent bucket sets. Safety margin of ~10%
    is applied to avoid hitting exact limits (Riot recommendation).
    """

    # Dev key defaults (with 10% safety margin)
    BURST_LIMIT = 18    # 20/1s → 18
    SPREAD_LIMIT = 90   # 100/2min → 90

    def __init__(
        self,
        burst_limit: int = BURST_LIMIT,
        spread_limit: int = SPREAD_LIMIT,
    ) -> None:
        self._burst_limit = burst_limit
        self._spread_limit = spread_limit
        self._buckets: dict[str, list[_Bucket]] = {}
        self._lock = asyncio.Lock()

    def _get_buckets(self, region: str) -> list[_Bucket]:
        if region not in self._buckets:
            self._buckets[region] = [
                _Bucket(max_tokens=self._burst_limit, interval=1.0),
                _Bucket(max_tokens=self._spread_limit, interval=120.0),
            ]
        return self._buckets[region]

    async def acquire(self, region: str) -> None:
        """Acquire a token from all buckets for the given region."""
        async with self._lock:
            for bucket in self._get_buckets(region):
                await bucket.acquire()

    def update_limits(
        self,
        region: str,
        app_rate_limit: str,
    ) -> None:
        """Update limits from Riot response header X-App-Rate-Limit.

        Format: "20:1,100:120" → 20 per 1s, 100 per 120s.
        """
        pairs = app_rate_limit.split(",")
        buckets: list[_Bucket] = []
        for pair in pairs:
            count_str, interval_str = pair.split(":")
            count = int(int(count_str) * 0.9)  # 10% safety margin
            interval = float(interval_str)
            buckets.append(_Bucket(max_tokens=count, interval=interval))
        self._buckets[region] = buckets
