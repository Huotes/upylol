"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalysisResponse } from "@/types";

export function useAnalysis(
  platform: string,
  gameName: string,
  tagLine: string,
  count = 30,
) {
  return useQuery<AnalysisResponse>({
    queryKey: ["analysis", platform, gameName, tagLine, count],
    queryFn: () =>
      api.analysis.get(
        platform,
        gameName,
        tagLine,
        count,
      ) as Promise<AnalysisResponse>,
    enabled: Boolean(gameName && tagLine),
    staleTime: 5 * 60 * 1000,
  });
}
