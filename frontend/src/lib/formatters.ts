/**
 * Display formatting utilities for game stats.
 */

/** Format KDA ratio: (K+A)/D */
export function formatKDA(kills: number, deaths: number, assists: number): string {
  const ratio = deaths === 0 ? "Perfect" : ((kills + assists) / deaths).toFixed(2);
  return `${kills}/${deaths}/${assists} (${ratio})`;
}

/** Format KDA as a single number */
export function kdaRatio(kills: number, deaths: number, assists: number): number {
  return deaths === 0 ? kills + assists : (kills + assists) / deaths;
}

/** Format win rate as percentage string */
export function formatWinRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/** Format CS per minute */
export function formatCSPerMin(cs: number): string {
  return `${cs.toFixed(1)} CS/min`;
}

/** Format game duration (seconds → MM:SS) */
export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/** Format large numbers with K/M suffix */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Get tier display name */
export function formatTier(tier: string, rank: string): string {
  if (tier === "UNRANKED") return "Unranked";
  const highTiers = ["MASTER", "GRANDMASTER", "CHALLENGER"];
  if (highTiers.includes(tier)) return capitalize(tier);
  return `${capitalize(tier)} ${rank}`;
}

/** Capitalize first letter */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Severity → color mapping */
export function severityColor(severity: string): string {
  const map: Record<string, string> = {
    critical: "text-red-400",
    important: "text-amber-400",
    minor: "text-sky-400",
  };
  return map[severity] ?? "text-gray-400";
}

/** Severity → background */
export function severityBg(severity: string): string {
  const map: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/30",
    important: "bg-amber-500/10 border-amber-500/30",
    minor: "bg-sky-500/10 border-sky-500/30",
  };
  return map[severity] ?? "bg-gray-500/10 border-gray-500/30";
}

/** Trend → icon/color */
export function trendIndicator(trend: string): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    improving: { icon: "↑", color: "text-emerald-400" },
    stable: { icon: "→", color: "text-gray-400" },
    declining: { icon: "↓", color: "text-red-400" },
  };
  return map[trend] ?? { icon: "—", color: "text-gray-400" };
}

/** Position label in Portuguese */
export function positionLabel(pos: string): string {
  const map: Record<string, string> = {
    TOP: "Top",
    JUNGLE: "Jungle",
    MIDDLE: "Mid",
    BOTTOM: "ADC",
    UTILITY: "Support",
  };
  return map[pos] ?? pos;
}
