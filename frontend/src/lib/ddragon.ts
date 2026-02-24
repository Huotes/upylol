/**
 * Data Dragon asset URL helpers with backend-synced version.
 *
 * On init, fetches the correct version + champion name map from our
 * backend (/api/v1/static/data), which caches DDragon data in Redis.
 * This avoids version mismatches and champion name inconsistencies
 * (e.g., FiddleSticks from Match API vs Fiddlesticks in DDragon).
 *
 * Optimized with:
 * - Promise deduplication (concurrent calls share same request)
 * - Fallback chain: backend → DDragon CDN → hardcoded version
 */

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "15.3.1";

/** State */
let resolvedVersion: string = FALLBACK_VERSION;
let championMap: Record<string, string> = {};
let initPromise: Promise<string> | null = null;

/** Placeholder for broken/missing images */
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%231a1a2e'%3E%3Crect width='120' height='120' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238888a0' font-size='14'%3E?%3C/text%3E%3C/svg%3E";

/**
 * Initialize DDragon data from our backend.
 * Deduplicates concurrent calls — only one fetch in flight at a time.
 */
export function initDdragonVersion(): Promise<string> {
  if (initPromise) return initPromise;
  initPromise = _doInit();
  return initPromise;
}

async function _doInit(): Promise<string> {
  // Try backend first (has champion_map for name resolution)
  try {
    const res = await fetch("/api/v1/static/data");
    if (res.ok) {
      const data = await res.json();
      resolvedVersion = data.version ?? FALLBACK_VERSION;
      championMap = data.champion_map ?? {};
      return resolvedVersion;
    }
  } catch {
    // Backend unavailable
  }

  // Fallback: DDragon CDN directly (no champion_map)
  try {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    if (res.ok) {
      const versions: string[] = await res.json();
      resolvedVersion = versions[0] ?? FALLBACK_VERSION;
    }
  } catch {
    // Use fallback
  }

  return resolvedVersion;
}

/** Resolve champion API name to DDragon asset name */
function resolveChampionName(apiName: string): string {
  return championMap[apiName] ?? apiName;
}

export const ddragon = {
  championIcon: (name: string) =>
    name
      ? `${DDRAGON_BASE}/cdn/${resolvedVersion}/img/champion/${resolveChampionName(name)}.png`
      : PLACEHOLDER,

  championSplash: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/splash/${resolveChampionName(name)}_${skinNum}.jpg`,

  championLoading: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/loading/${resolveChampionName(name)}_${skinNum}.jpg`,

  /** Profile icon */
  profileIcon: (iconId: number) =>
    iconId > 0
      ? `${DDRAGON_BASE}/cdn/${resolvedVersion}/img/profileicon/${iconId}.png`
      : PLACEHOLDER,

  /** Item icon — returns null for empty item slots (ID 0) */
  itemIcon: (itemId: number) =>
    itemId > 0
      ? `${DDRAGON_BASE}/cdn/${resolvedVersion}/img/item/${itemId}.png`
      : null,

  /** Summoner spell icon */
  spellIcon: (spellName: string) =>
    `${DDRAGON_BASE}/cdn/${resolvedVersion}/img/spell/${spellName}.png`,

  /** Ranked emblem from community dragon */
  rankedEmblem: (tier: string) =>
    `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.svg`,

  /** Get current resolved version */
  get version() {
    return resolvedVersion;
  },

  /** Placeholder image for missing assets */
  placeholder: PLACEHOLDER,
  resolveChampion: resolveChampionName,
} as const;
