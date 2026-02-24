"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MatchDetailResponse } from "@/types";

export function useMatchDetail(
  matchId: string,
  puuid: string,
  platform = "br1",
  tier = "SILVER",
) {
  return useQuery<MatchDetailResponse>({
    queryKey: ["matchDetail", matchId, puuid],
    queryFn: () =>
      api.matches.detail(matchId, puuid, platform, tier) as Promise<MatchDetailResponse>,
    enabled: Boolean(matchId && puuid),
    staleTime: 60 * 60 * 1000, // 1h — match data is immutable
  });
}
