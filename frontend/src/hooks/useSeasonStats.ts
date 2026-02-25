"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SeasonStats } from "@/types";

export function useSeasonStats(
  platform: string,
  gameName: string,
  tagLine: string,
  season = "current",
) {
  return useQuery<SeasonStats>({
    queryKey: ["season-stats", platform, gameName, tagLine, season],
    queryFn: () =>
      api.player.seasonStats(platform, gameName, tagLine, season) as Promise<SeasonStats>,
    enabled: !!gameName && !!tagLine,
    staleTime: season === "current" ? 5 * 60_000 : 60 * 60_000,
    placeholderData: keepPreviousData,
  });
}
