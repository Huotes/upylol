import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format KDA ratio */
export function formatKDA(
  kills: number,
  deaths: number,
  assists: number,
): string {
  const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
  return kda.toFixed(2);
}

/** KDA color based on value */
export function getKDAColor(kda: number): string {
  if (kda >= 5) return "text-[var(--color-gold-accent)]";
  if (kda >= 3) return "text-[var(--color-cyan-glow)]";
  if (kda >= 2) return "text-[var(--color-text-primary)]";
  return "text-[var(--color-text-muted)]";
}

/** Format CS per minute */
export function formatCSPerMin(cs: number, durationSeconds: number): string {
  const minutes = durationSeconds / 60;
  return (cs / minutes).toFixed(1);
}

/** Format game duration (seconds → "32m 15s") */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/** Format time ago (timestamp → "2h ago", "3d ago") */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 30) return `${days}d atrás`;
  return `${Math.floor(days / 30)}m atrás`;
}

/** Format win rate percentage */
export function formatWinRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return "0%";
  return `${((wins / total) * 100).toFixed(1)}%`;
}

/** Get win rate color */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return "text-[var(--color-gold-accent)]";
  if (winRate >= 55) return "text-[var(--color-cyan-glow)]";
  if (winRate >= 50) return "text-[var(--color-win)]";
  if (winRate >= 45) return "text-[var(--color-text-secondary)]";
  return "text-[var(--color-loss)]";
}

/** Score color based on 0-100 value */
export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-gold-accent)";
  if (score >= 65) return "var(--color-win)";
  if (score >= 50) return "var(--color-cyan-glow)";
  if (score >= 35) return "var(--color-text-secondary)";
  return "var(--color-loss)";
}

/** Score label based on 0-100 value */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 65) return "Bom";
  if (score >= 50) return "Médio";
  if (score >= 35) return "Abaixo";
  return "Fraco";
}

/** Format large numbers (1234 → "1.2k") */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

/** Rank display string ("GOLD II" → "Gold II") */
export function formatRank(tier: string, rank: string): string {
  const formatted = tier.charAt(0) + tier.slice(1).toLowerCase();
  // Master+ don't have divisions
  if (["Master", "Grandmaster", "Challenger"].includes(formatted)) {
    return formatted;
  }
  return `${formatted} ${rank}`;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Build summoner URL path */
export function summonerPath(
  region: string,
  gameName: string,
  tagLine: string,
): string {
  return `/summoner/${region}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`;
}

/** Parse summoner name from URL param ("Name-TAG" → {gameName, tagLine}) */
export function parseSummonerName(nameParam: string): {
  gameName: string;
  tagLine: string;
} {
  const decoded = decodeURIComponent(nameParam);
  const lastDash = decoded.lastIndexOf("-");
  if (lastDash === -1) {
    return { gameName: decoded, tagLine: "BR1" };
  }
  return {
    gameName: decoded.slice(0, lastDash),
    tagLine: decoded.slice(lastDash + 1),
  };
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
