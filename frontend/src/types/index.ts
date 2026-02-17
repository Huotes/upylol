/* ── Player ─────────────────────────────────────────── */

export interface RankedInfo {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  win_rate: number;
  hot_streak: boolean;
}

export interface PlayerProfile {
  puuid: string;
  game_name: string;
  tag_line: string;
  platform: string;
  summoner_level: number;
  profile_icon_id: number;
  ranked: RankedInfo;
  top_mastery: ChampionMastery[];
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
}

/* ── Analysis ──────────────────────────────────────── */

export interface DimensionScore {
  name: string;
  score: number;
  raw_value: number;
  benchmark: number;
  percentile: number;
}

export interface Performance {
  overall_score: number;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
}

export interface Diagnostic {
  category: string;
  severity: "critical" | "important" | "minor";
  title: string;
  description: string;
  recommendation: string;
}

export interface ChampionPerformance {
  champion_name: string;
  games: number;
  wins?: number;
  losses?: number;
  win_rate: number;
  avg_kda: number;
  avg_cs_per_min: number;
  avg_damage_per_min?: number;
  avg_vision_per_min?: number;
  positions: string[];
}

export interface Trend {
  metric: string;
  trend: "improving" | "stable" | "declining";
  early_avg: number;
  recent_avg: number;
  change_pct: number;
}

export interface AnalysisResponse {
  games_analyzed: number;
  wins: number;
  losses: number;
  win_rate: number;
  performance: Performance;
  diagnostics: Diagnostic[];
  best_champions: ChampionPerformance[];
  mains: string[];
  champion_pool: Record<string, unknown>;
  trends: Trend[];
}

/* ── Champions ─────────────────────────────────────── */

export interface ChampionsResponse {
  games_analyzed: number;
  champions: ChampionPerformance[];
  pool_suggestion: Record<string, unknown>;
}

/* ── Match (simplified for list display) ───────────── */

export interface MatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  goldEarned: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  teamPosition: string;
}

export interface MatchInfo {
  gameDuration: number;
  queueId: number;
  participants: MatchParticipant[];
}

export interface MatchData {
  metadata: { matchId: string; participants: string[] };
  info: MatchInfo;
}

/* ── Misc ──────────────────────────────────────────── */

export type Region =
  | "br1"
  | "na1"
  | "euw1"
  | "eun1"
  | "kr"
  | "jp1"
  | "la1"
  | "la2"
  | "oc1"
  | "tr1"
  | "ru";

export const REGION_LABELS: Record<Region, string> = {
  br1: "Brasil",
  na1: "North America",
  euw1: "EU West",
  eun1: "EU Nordic & East",
  kr: "Korea",
  jp1: "Japan",
  la1: "LAN",
  la2: "LAS",
  oc1: "Oceania",
  tr1: "Turkey",
  ru: "Russia",
};
