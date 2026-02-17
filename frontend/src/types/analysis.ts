/** Performance dimension scores (0-100) */
export interface PerformanceScores {
  farming: number;
  fighting: number;
  vision: number;
  survivability: number;
  economy: number;
  consistency: number;
  objectives: number;
}

/** Dimension metadata for display */
export interface DimensionMeta {
  key: keyof PerformanceScores;
  label: string;
  description: string;
  color: string;
  icon: string;
}

/** Performance dimension labels and metadata */
export const DIMENSIONS: DimensionMeta[] = [
  {
    key: "farming",
    label: "Farming",
    description: "CS/min e eficiência de farm",
    color: "var(--color-dim-farming)",
    icon: "Wheat",
  },
  {
    key: "fighting",
    label: "Luta",
    description: "KDA e participação em abates",
    color: "var(--color-dim-fighting)",
    icon: "Swords",
  },
  {
    key: "vision",
    label: "Visão",
    description: "Vision score e controle de mapa",
    color: "var(--color-dim-vision)",
    icon: "Eye",
  },
  {
    key: "survivability",
    label: "Sobrevivência",
    description: "Mortes e posicionamento",
    color: "var(--color-dim-survivability)",
    icon: "Shield",
  },
  {
    key: "economy",
    label: "Economia",
    description: "Gold/min e eficiência",
    color: "var(--color-dim-economy)",
    icon: "Coins",
  },
  {
    key: "consistency",
    label: "Consistência",
    description: "Regularidade entre partidas",
    color: "var(--color-dim-consistency)",
    icon: "TrendingUp",
  },
  {
    key: "objectives",
    label: "Objetivos",
    description: "Participação em objetivos",
    color: "var(--color-dim-objectives)",
    icon: "Target",
  },
];

/** Diagnostic entry from analysis engine */
export interface Diagnostic {
  dimension: string;
  severity: "critical" | "important" | "minor";
  title: string;
  description: string;
  recommendation: string;
  player_value: number;
  benchmark_value: number;
}

/** Strength/weakness entry */
export interface DimensionInsight {
  dimension: string;
  score: number;
  label: string;
}

/** Trend comparison data */
export interface TrendData {
  dimension: string;
  early_score: number;
  recent_score: number;
  delta: number;
  trending: "improving" | "declining" | "stable";
}

/** Complete analysis response from API */
export interface AnalysisResponse {
  overall_score: number;
  scores: PerformanceScores;
  strengths: DimensionInsight[];
  weaknesses: DimensionInsight[];
  diagnostics: Diagnostic[];
  trends: TrendData[];
  games_analyzed: number;
  tier_benchmark: string;
}
