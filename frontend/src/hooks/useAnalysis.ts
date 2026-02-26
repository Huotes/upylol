"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalysisResponse } from "@/types";

export function useAnalysis(
  platform: string,
  gameName: string,
  tagLine: string,
  count = 30,
  role = "",
) {
  return useQuery<AnalysisResponse>({
    queryKey: ["analysis", platform, gameName, tagLine, count, role],
    queryFn: () =>
      api.analysis.get(
        platform,
        gameName,
        tagLine,
        count,
        role,
      ) as Promise<AnalysisResponse>,
    enabled: Boolean(gameName && tagLine),
    staleTime: 5 * 60 * 1000,
    // Keep previous data visible while fetching new count/role
    placeholderData: keepPreviousData,
  });
}
