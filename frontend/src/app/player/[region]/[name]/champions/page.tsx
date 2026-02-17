"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useChampions } from "@/hooks/useChampions";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import { ChampionGrid } from "@/components/champions/ChampionGrid";
import { Card, CardTitle } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function ChampionsPage({ params }: PageProps) {
  const { region, name } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const player = usePlayer(region, gameName, tag);
  const champions = useChampions(
    player.data?.puuid ?? "",
    region,
  );

  if (player.isLoading || champions.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (player.isError || !player.data) {
    return (
      <ErrorDisplay
        title="Jogador não encontrado"
        message={`"${gameName}#${tag}" não encontrado.`}
        onRetry={() => player.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCard player={player.data} />
      <PlayerNav region={region} name={gameName} tag={tag} />

      {/* Champion Pool Suggestion */}
      {champions.data?.pool_suggestion && (
        <Card>
          <CardTitle>Recomendação de Pool</CardTitle>
          <p className="text-sm text-text-secondary">
            {(champions.data.pool_suggestion as Record<string, string>)
              .recommendation ?? "Jogue mais partidas para receber recomendações."}
          </p>
          {(champions.data.pool_suggestion as Record<string, string[]>)
            .high_winrate_picks?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                champions.data.pool_suggestion as Record<string, string[]>
              ).high_winrate_picks.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* All Champions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Todos os Campeões ({champions.data?.champions.length ?? 0})
        </h2>
        {champions.data?.champions && champions.data.champions.length > 0 ? (
          <ChampionGrid champions={champions.data.champions} />
        ) : (
          <p className="text-sm text-text-secondary">
            Nenhum dado de campeão disponível.
          </p>
        )}
      </div>
    </div>
  );
}
