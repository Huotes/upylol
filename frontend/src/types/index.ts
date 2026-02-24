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
  data?: Record<string, unknown>;
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

/* ── Match Detail ──────────────────────────────────── */

export interface ParticipantDetail {
  puuid: string;
  champion_name: string;
  team_id: number;
  position: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  cs_per_min: number;
  gold_earned: number;
  gold_per_min: number;
  damage_dealt: number;
  damage_per_min: number;
  damage_taken: number;
  vision_score: number;
  vision_per_min: number;
  wards_placed: number;
  wards_killed: number;
  kill_participation: number;
  items: number[];
  summoner_spells: number[];
  champion_level: number;
  summoner_name: string;
}

export interface DeathEvent {
  timestamp_sec: number;
  game_phase: "early" | "mid" | "late";
  position_x: number;
  position_y: number;
  killer: string;
  assisters: string[];
  num_enemies: number;
  description: string;
}

export interface ObjectiveEvent {
  timestamp_sec: number;
  event_type: "dragon" | "baron" | "herald" | "tower" | "inhibitor";
  team: "ally" | "enemy";
  subtype: string;
}

export interface GoldDiffPoint {
  minute: number;
  gold_diff: number;
}

export interface PhaseStats {
  phase: "early" | "mid" | "late";
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  cs_per_min: number;
  gold: number;
  gold_per_min: number;
}

export interface BenchmarkStat {
  value: number;
  benchmark: number;
  diff: number;
  percentile: number;
  tier: string;
  status: "above" | "below" | "at";
}

export interface ImprovementPoint {
  category: string;
  severity: "critical" | "important" | "minor";
  title: string;
  description: string;
  recommendation: string;
}

export interface MatchDetailAnalysis {
  match_id: string;
  duration_sec: number;
  duration_min: number;
  queue_id: number;
  game_start_timestamp: number;
  player: ParticipantDetail;
  player_team: ParticipantDetail[];
  enemy_team: ParticipantDetail[];
  stats_vs_benchmark: Record<string, BenchmarkStat>;
  gold_diff_timeline: GoldDiffPoint[];
  phase_stats: PhaseStats[];
  deaths: DeathEvent[];
  objectives: ObjectiveEvent[];
  ally_dragons: number;
  enemy_dragons: number;
  ally_barons: number;
  enemy_barons: number;
  ally_heralds: number;
  enemy_heralds: number;
  ally_towers: number;
  enemy_towers: number;
  improvement_points: ImprovementPoint[];
  performance_grade: string;
}

export interface MatchDetailResponse {
  match: MatchData;
  analysis: MatchDetailAnalysis;
}

/* ── Game count filter options ─────────────────────── */

export const GAME_COUNT_OPTIONS = [
  { value: 10, label: "10 games" },
  { value: 20, label: "20 games" },
  { value: 30, label: "30 games" },
  { value: 100, label: "Temporada" },
] as const;

export type GameCount = (typeof GAME_COUNT_OPTIONS)[number]["value"];
