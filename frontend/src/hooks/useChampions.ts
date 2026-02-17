"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChampionsResponse } from "@/types";

export function useChampions(puuid: string, platform = "br1", count = 30) {
  return useQuery<ChampionsResponse>({
    queryKey: ["champions", puuid, platform, count],
    queryFn: () =>
      api.champions.get(puuid, platform, count) as Promise<ChampionsResponse>,
    enabled: Boolean(puuid),
  });
}
