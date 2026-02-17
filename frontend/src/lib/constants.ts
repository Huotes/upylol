import { ddragon } from "./ddragon";

/** Dimension display labels (PT-BR) */
export const DIMENSION_LABELS: Record<string, string> = {
  farming: "Farm",
  fighting: "Combate",
  vision: "Visão",
  objectives: "Objetivos",
  consistency: "Consistência",
  survivability: "Sobrevivência",
  economy: "Economia",
};

/** Queue type labels */
export const QUEUE_LABELS: Record<number, string> = {
  420: "Ranked Solo/Duo",
  440: "Ranked Flex",
  400: "Normal Draft",
  430: "Normal Blind",
  450: "ARAM",
};

/** Queue display names (alias) */
export const QUEUE_NAMES = QUEUE_LABELS;

/** Position display labels */
export const POSITION_NAMES: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

/** Tier colors for ranked badges */
export const TIER_COLORS: Record<string, string> = {
  IRON: "#6b6b6b",
  BRONZE: "#a0522d",
  SILVER: "#b0b0b0",
  GOLD: "#daa520",
  PLATINUM: "#00c9a7",
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#9370db",
  GRANDMASTER: "#ff4444",
  CHALLENGER: "#f0c040",
  UNRANKED: "#555555",
};

/** Champion icon URL helper (re-exports ddragon) */
export const getChampionIconUrl = ddragon.championIcon;

/** Item icon URL helper (re-exports ddragon) */
export const getItemIconUrl = ddragon.itemIcon;
