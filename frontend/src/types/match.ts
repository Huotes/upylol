/** Individual match summary from API */
export interface MatchSummary {
  match_id: string;
  game_duration: number;
  game_start_timestamp: number;
  queue_id: number;
  game_version: string;
  participant: MatchParticipant;
}

/** Participant data for a single match */
export interface MatchParticipant {
  puuid: string;
  champion_id: number;
  champion_name: string;
  summoner_name: string;
  team_id: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  cs_per_min: number;
  vision_score: number;
  damage_dealt: number;
  damage_taken: number;
  gold_earned: number;
  gold_per_min: number;
  kill_participation: number;
  items: number[];
  summoner_spells: number[];
  individual_position: string;
  team_position: string;
}

/** Match list response from API */
export interface MatchListResponse {
  matches: MatchSummary[];
  total: number;
}

/** Queue type constants */
export const QUEUE_NAMES: Record<number, string> = {
  420: "Ranked Solo/Duo",
  440: "Ranked Flex",
  400: "Normal Draft",
  430: "Normal Blind",
  450: "ARAM",
  700: "Clash",
  900: "URF",
  1700: "Arena",
};

/** Role/position display names */
export const POSITION_NAMES: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

/** Role icons (Lucide icon names) */
export const POSITION_ICONS: Record<string, string> = {
  TOP: "Shield",
  JUNGLE: "Trees",
  MIDDLE: "Zap",
  BOTTOM: "Crosshair",
  UTILITY: "Heart",
};
