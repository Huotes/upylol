"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MatchData } from "@/types";

export function useMatches(
  puuid: string,
  platform = "br1",
  count = 20,
  queue?: number,
) {
  return useQuery<MatchData[]>({
    queryKey: ["matches", puuid, platform, count, queue],
    queryFn: () =>
      api.matches.list(puuid, platform, count, queue) as Promise<MatchData[]>,
    enabled: Boolean(puuid),
  });
}
