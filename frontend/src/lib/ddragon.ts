/**
 * Data Dragon (ddragon) asset URL helpers.
 *
 * CDN: https://ddragon.leagueoflegends.com/cdn/{version}/img/...
 * Splash: https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{name}_0.jpg
 * Versions: https://ddragon.leagueoflegends.com/api/versions.json
 */

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const VERSION = process.env.NEXT_PUBLIC_DDRAGON_VERSION ?? "16.3.1";

export const ddragon = {
  /** Champion square icon (120x120) */
  championIcon: (name: string) =>
    `${DDRAGON_BASE}/cdn/${VERSION}/img/champion/${name}.png`,

  /** Champion splash art (full) */
  championSplash: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/splash/${name}_${skinNum}.jpg`,

  /** Champion loading screen art */
  championLoading: (name: string, skinNum = 0) =>
    `${DDRAGON_BASE}/cdn/img/champion/loading/${name}_${skinNum}.jpg`,

  /** Profile icon */
  profileIcon: (iconId: number) =>
    `${DDRAGON_BASE}/cdn/${VERSION}/img/profileicon/${iconId}.png`,

  /** Item icon */
  itemIcon: (itemId: number) =>
    `${DDRAGON_BASE}/cdn/${VERSION}/img/item/${itemId}.png`,

  /** Summoner spell icon */
  spellIcon: (spellName: string) =>
    `${DDRAGON_BASE}/cdn/${VERSION}/img/spell/${spellName}.png`,

  /** Ranked emblem from community dragon */
  rankedEmblem: (tier: string) =>
    `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.svg`,

  /** Current patch version */
  version: VERSION,
} as const;
