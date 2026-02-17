/** Riot League entry for a queue */
export interface LeagueEntry {
  queue_type: string;
  tier: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
  hot_streak: boolean;
  veteran: boolean;
  fresh_blood: boolean;
  inactive: boolean;
}

/** Complete summoner profile from API */
export interface SummonerProfile {
  game_name: string;
  tag_line: string;
  puuid: string;
  summoner_level: number;
  profile_icon_id: number;
  leagues: LeagueEntry[];
  top_mastery: MasteryEntry[];
}

/** Champion mastery entry */
export interface MasteryEntry {
  champion_id: number;
  champion_level: number;
  champion_points: number;
  last_play_time: number;
}

/** Tier type union */
export type Tier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

/** Rank division union */
export type RankDivision = "I" | "II" | "III" | "IV";

/** Platform/region identifiers */
export type Platform =
  | "br1"
  | "eun1"
  | "euw1"
  | "jp1"
  | "kr"
  | "la1"
  | "la2"
  | "na1"
  | "oc1"
  | "tr1"
  | "ru"
  | "ph2"
  | "sg2"
  | "th2"
  | "tw2"
  | "vn2";
