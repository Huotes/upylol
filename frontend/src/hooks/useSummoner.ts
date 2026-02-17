import { useQuery } from "@tanstack/react-query";
import { fetchPlayer } from "@/lib/api";

/** Query keys for summoner data */
export const summonerKeys = {
  all: ["summoner"] as const,
  detail: (platform: string, gameName: string, tagLine: string) =>
    [...summonerKeys.all, platform, gameName, tagLine] as const,
};

/** Fetch and cache summoner profile */
export function useSummoner(
  platform: string,
  gameName: string,
  tagLine: string,
) {
  return useQuery({
    queryKey: summonerKeys.detail(platform, gameName, tagLine),
    queryFn: () => fetchPlayer(platform, gameName, tagLine),
    enabled: Boolean(platform && gameName && tagLine),
    staleTime: 5 * 60 * 1000, // 5min — profile changes infrequently
  });
}
