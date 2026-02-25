"""League of Legends season date ranges.

Used for filtering match history by season/split.
Riot transitioned to a 3-split-per-year model in 2025.
Timestamps are epoch seconds (UTC).
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Season:
    """A ranked season (split) with start/end timestamps."""

    key: str          # e.g. "2025_S1"
    label: str        # e.g. "2025 Split 1"
    start_ts: int     # epoch seconds
    end_ts: int       # epoch seconds


# Approximate dates based on Riot's official announcements.
# Adjusted to midnight UTC on start/end days.
SEASONS: list[Season] = [
    Season(
        key="2025_S1",
        label="2025 Split 1",
        start_ts=1736294400,   # 2025-01-08 00:00 UTC
        end_ts=1746662400,     # 2025-05-08 00:00 UTC
    ),
    Season(
        key="2025_S2",
        label="2025 Split 2",
        start_ts=1746662400,   # 2025-05-08 00:00 UTC
        end_ts=1756944000,     # 2025-09-04 00:00 UTC
    ),
    Season(
        key="2025_S3",
        label="2025 Split 3",
        start_ts=1756944000,   # 2025-09-04 00:00 UTC
        end_ts=1736294400 + 365 * 86400,  # ~2026-01-08
    ),
    Season(
        key="2026_S1",
        label="2026 Split 1",
        start_ts=1736294400 + 365 * 86400,  # ~2026-01-08
        end_ts=1746662400 + 365 * 86400,    # ~2026-05-08
    ),
]

_SEASON_MAP: dict[str, Season] = {s.key: s for s in SEASONS}


def get_season(key: str) -> Season | None:
    """Get a season by key, or None if not found."""
    return _SEASON_MAP.get(key)


def get_current_season() -> Season | None:
    """Get the most recent season (last in the list)."""
    import time

    now = int(time.time())
    for season in reversed(SEASONS):
        if season.start_ts <= now < season.end_ts:
            return season
    # Fallback: return last season if none matches
    return SEASONS[-1] if SEASONS else None


def get_available_seasons() -> list[dict[str, str]]:
    """Return list of seasons for frontend dropdown."""
    return [{"key": s.key, "label": s.label} for s in SEASONS]
