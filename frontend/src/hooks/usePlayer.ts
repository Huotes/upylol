"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PlayerProfile } from "@/types";

export function usePlayer(platform: string, gameName: string, tagLine: string) {
  return useQuery<PlayerProfile>({
    queryKey: ["player", platform, gameName, tagLine],
    queryFn: () =>
      api.player.get(platform, gameName, tagLine) as Promise<PlayerProfile>,
    enabled: Boolean(gameName && tagLine),
    staleTime: 5 * 60 * 1000,
  });
}
