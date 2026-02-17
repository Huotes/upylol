"use client";

import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useMatches } from "@/hooks/useMatches";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import { MatchCard } from "@/components/matches/MatchCard";
import { QueueFilter } from "@/components/matches/QueueFilter";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function MatchesPage({ params }: PageProps) {
  const { region, name } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const [queue, setQueue] = useState<number | undefined>(420);

  const player = usePlayer(region, gameName, tag);
  const matches = useMatches(
    player.data?.puuid ?? "",
    region,
    30,
    queue,
  );

  if (player.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Histórico de Partidas
        </h2>
        <QueueFilter selected={queue} onChange={setQueue} />
      </div>

      {matches.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
      )}

      {matches.isError && (
        <ErrorDisplay
          message="Erro ao carregar partidas."
          onRetry={() => matches.refetch()}
        />
      )}

      {matches.data && matches.data.length === 0 && (
        <p className="py-8 text-center text-sm text-text-secondary">
          Nenhuma partida encontrada para este filtro.
        </p>
      )}

      {matches.data && matches.data.length > 0 && (
        <div className="space-y-2">
          {matches.data.map((match) => (
            <MatchCard
              key={match.metadata.matchId}
              match={match}
              puuid={player.data!.puuid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
