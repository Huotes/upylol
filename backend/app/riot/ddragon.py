"""DDragon data service — fetch, cache and serve game static data.

Downloads champion, item, and version data from Riot's Data Dragon CDN
and caches them in Redis. Data only changes every ~2 weeks (per patch).

Usage:
    ddragon = DDragonService(cache)
    await ddragon.ensure_loaded()     # Fetch on first call, cache after
    version = ddragon.version         # "16.4.1"
    name = ddragon.champion_key("FiddleSticks")  # "Fiddlesticks"
"""

import logging
from typing import Any

import httpx

from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)

DDRAGON_BASE = "https://ddragon.leagueoflegends.com"
CACHE_TTL_STATIC = 86400  # 24 hours — patches are every 2 weeks
CACHE_KEY_VERSION = "upylol:ddragon:version"
CACHE_KEY_CHAMPIONS = "upylol:ddragon:champions"
CACHE_KEY_ITEMS = "upylol:ddragon:items"
CACHE_KEY_CHAMPION_MAP = "upylol:ddragon:champion_map"


class DDragonService:
    """Manages Data Dragon static game data with Redis caching."""

    def __init__(self, cache: CacheService) -> None:
        self._cache = cache
        self._version: str = ""
        self._champion_map: dict[str, str] = {}  # API name -> DDragon key
        self._champions: dict[str, Any] = {}
        self._items: dict[str, Any] = {}
        self._loaded = False

    @property
    def version(self) -> str:
        return self._version

    @property
    def champions(self) -> dict[str, Any]:
        return self._champions

    @property
    def items(self) -> dict[str, Any]:
        return self._items

    def champion_key(self, api_name: str) -> str:
        """Convert Match API champion name to DDragon asset key.

        Handles known mismatches like FiddleSticks -> Fiddlesticks.
        Falls back to the original name if no mapping found.
        """
        return self._champion_map.get(api_name, api_name)

    async def ensure_loaded(self) -> None:
        """Load data from cache or fetch from DDragon CDN."""
        if self._loaded:
            return

        # Try loading from Redis cache first
        cached_version = await self._cache.get(CACHE_KEY_VERSION)
        if cached_version:
            self._version = cached_version
            cached_map = await self._cache.get(CACHE_KEY_CHAMPION_MAP)
            cached_champs = await self._cache.get(CACHE_KEY_CHAMPIONS)
            cached_items = await self._cache.get(CACHE_KEY_ITEMS)

            if cached_map and cached_champs:
                self._champion_map = cached_map
                self._champions = cached_champs
                self._items = cached_items or {}
                self._loaded = True
                logger.info(
                    "DDragon loaded from cache: v%s (%d champions, %d items)",
                    self._version, len(self._champions), len(self._items),
                )
                return

        # Fetch fresh from DDragon CDN
        await self._fetch_all()

    async def refresh(self) -> None:
        """Force refresh from DDragon CDN (call on patch day)."""
        self._loaded = False
        await self._fetch_all()

    async def _fetch_all(self) -> None:
        """Fetch version, champions, and items from DDragon."""
        async with httpx.AsyncClient(timeout=15.0) as http:
            # 1. Get latest version
            try:
                resp = await http.get(f"{DDRAGON_BASE}/api/versions.json")
                resp.raise_for_status()
                versions: list[str] = resp.json()
                self._version = versions[0] if versions else "15.3.1"
            except Exception:
                logger.warning("Failed to fetch DDragon versions, using fallback")
                self._version = "15.3.1"

            logger.info("DDragon version: %s", self._version)

            # 2. Fetch champion data
            try:
                resp = await http.get(
                    f"{DDRAGON_BASE}/cdn/{self._version}/data/en_US/champion.json"
                )
                resp.raise_for_status()
                champ_data = resp.json().get("data", {})

                # Build champion map and compact data
                self._champions = {}
                self._champion_map = {}

                for key, champ in champ_data.items():
                    champ_id = champ.get("key", "0")
                    champ_name = champ.get("name", key)

                    self._champions[key] = {
                        "id": key,
                        "key": champ_id,
                        "name": champ_name,
                        "title": champ.get("title", ""),
                        "tags": champ.get("tags", []),
                    }

                    # Map: DDragon key -> itself (for normal lookups)
                    self._champion_map[key] = key

                    # Map: if API returns different name, map it too
                    # Known issues: FiddleSticks (API) vs Fiddlesticks (DDragon)
                    if champ_name != key:
                        self._champion_map[champ_name] = key

                # Add known API name mismatches
                _KNOWN_MISMATCHES = {
                    "FiddleSticks": "Fiddlesticks",
                    "MonkeyKing": "MonkeyKing",  # Wukong uses MonkeyKing in both
                }
                for api_name, ddragon_key in _KNOWN_MISMATCHES.items():
                    if ddragon_key in champ_data:
                        self._champion_map[api_name] = ddragon_key

                logger.info("Loaded %d champions", len(self._champions))

            except Exception:
                logger.exception("Failed to fetch champion data")

            # 3. Fetch item data
            try:
                resp = await http.get(
                    f"{DDRAGON_BASE}/cdn/{self._version}/data/en_US/item.json"
                )
                resp.raise_for_status()
                item_data = resp.json().get("data", {})

                self._items = {}
                for item_id, item in item_data.items():
                    self._items[item_id] = {
                        "id": int(item_id),
                        "name": item.get("name", ""),
                        "gold": item.get("gold", {}).get("total", 0),
                        "description": item.get("plaintext", ""),
                    }

                logger.info("Loaded %d items", len(self._items))

            except Exception:
                logger.exception("Failed to fetch item data")

        # Cache everything in Redis
        await self._cache.set(CACHE_KEY_VERSION, self._version, CACHE_TTL_STATIC)
        await self._cache.set(CACHE_KEY_CHAMPION_MAP, self._champion_map, CACHE_TTL_STATIC)
        await self._cache.set(CACHE_KEY_CHAMPIONS, self._champions, CACHE_TTL_STATIC)
        await self._cache.set(CACHE_KEY_ITEMS, self._items, CACHE_TTL_STATIC)

        self._loaded = True

    def get_static_data(self) -> dict[str, Any]:
        """Return all static data for the frontend in one payload."""
        return {
            "version": self._version,
            "champions": self._champions,
            "champion_map": self._champion_map,
            "items": self._items,
            "cdn_base": f"{DDRAGON_BASE}/cdn/{self._version}",
        }
