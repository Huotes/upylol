/** Champion performance stats for a player */
export interface ChampionPerformance {
  champion_id: number;
  champion_name: string;
  games: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_kda: number;
  avg_cs_per_min: number;
  avg_damage_per_min: number;
  avg_vision_per_min: number;
  weighted_score: number;
}

/** Champion pool suggestion from API */
export interface PoolSuggestion {
  primary_pick: ChampionPerformance | null;
  high_winrate_picks: ChampionPerformance[];
  pool_size: number;
}

/** Champions response from API */
export interface ChampionsResponse {
  champions: ChampionPerformance[];
  pool_suggestion: PoolSuggestion;
}
