/**
 * Data Dragon (ddragon) asset URL helpers.
 *
 * CDN: https://ddragon.leagueoflegends.com/cdn/{version}/img/...
 * Versions: https://ddragon.leagueoflegends.com/api/versions.json
 *
 * The version is auto-fetched from Riot's API on first use,
 * falling back to the env var or a hardcoded default.
 */

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = process.env.NEXT_PUBLIC_DDRAGON_VERSION ?? "15.3.1";

/** Cached resolved version */
let resolvedVersion: string = FALLBACK_VERSION;
let fetched = false;

/** Fetch latest DDragon version from Riot API */
async function fetchLatestVersion(): Promise<string> {
  try {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    if (!res.ok) return FALLBACK_VERSION;
    const versions: string[] = await res.json();
    return versions[0] ?? FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

/** Initialize version detection — call from a client component */
export async function initDdragonVersion(): Promise<string> {
  if (fetched) return resolvedVersion;
  fetched = true;
  resolvedVersion = await fetchLatestVersion();
  return resolvedVersion;
}

/** Placeholder for broken/missing images */
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%231a1a2e'%3E%3Crect width='120' height='120' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238888a0' font-size='14'%3E?%3C/text%3E%3C/svg%3E";

export const ddragon = {
  /** Champion square icon (120x120) */
  championIcon: (name: string) =>
    name
      ? `${DDRAGON_BASE}/cdn/${resolvedVersion}/img/champion/${name}.png`
      : PLACEHOLDER,

  /** Champion splash art (full) */
  championSplash: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/splash/${name}_${skinNum}.jpg`,

  /** Champion loading screen art */
  championLoading: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/loading/${name}_${skinNum}.jpg`,

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
} as const;
