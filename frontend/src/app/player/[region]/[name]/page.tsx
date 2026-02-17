"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useAnalysis } from "@/hooks/useAnalysis";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PerformanceRadar } from "@/components/analysis/PerformanceRadar";
import { DiagnosticCard } from "@/components/analysis/DiagnosticCard";
import { TrendList } from "@/components/analysis/TrendList";
import { ChampionCard } from "@/components/champions/ChampionCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Card, CardTitle } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { PlayerSearch } from "@/components/search/PlayerSearch";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function PlayerPage({ params }: PageProps) {
  const { region, name } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const player = usePlayer(region, gameName, tag);
  const analysis = useAnalysis(region, gameName, tag);

  if (player.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (player.isError) {
    return (
      <div className="space-y-6">
        <PlayerSearch className="mx-auto" />
        <ErrorDisplay
          title="Jogador não encontrado"
          message={`Não foi possível encontrar "${gameName}#${tag}" na região ${region}.`}
          onRetry={() => player.refetch()}
        />
      </div>
    );
  }

  if (!player.data) return null;

  return (
    <div className="space-y-6">
      <ProfileCard player={player.data} />
      <PlayerNav region={region} name={gameName} tag={tag} />

      {analysis.isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {analysis.data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Radar + Score */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Score</CardTitle>
                <div className="relative flex items-center justify-center">
                  <ScoreRing score={analysis.data.performance.overall_score} />
                </div>
              </div>
              <PerformanceRadar dimensions={analysis.data.performance.dimensions} />
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.data.performance.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                  >
                    ✓ {s}
                  </span>
                ))}
                {analysis.data.performance.weaknesses.map((w) => (
                  <span
                    key={w}
                    className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
                  >
                    ✗ {w}
                  </span>
                ))}
              </div>
            </Card>

            {/* Diagnostics */}
            {analysis.data.diagnostics.length > 0 && (
              <Card>
                <CardTitle>Diagnóstico de Melhorias</CardTitle>
                <div className="space-y-3">
                  {analysis.data.diagnostics.map((d, i) => (
                    <DiagnosticCard key={`${d.category}-${i}`} diagnostic={d} />
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Best Champions */}
            <Card>
              <CardTitle>Melhores Campeões</CardTitle>
              <div className="space-y-2">
                {analysis.data.best_champions.map((champ, i) => (
                  <ChampionCard
                    key={champ.champion_name}
                    champion={champ}
                    rank={i + 1}
                  />
                ))}
              </div>
            </Card>

            {/* Trends */}
            <TrendList trends={analysis.data.trends} />

            {/* Summary */}
            <Card>
              <CardTitle>Resumo</CardTitle>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Partidas analisadas</span>
                  <span className="font-mono font-bold">
                    {analysis.data.games_analyzed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Win Rate</span>
                  <span className="font-mono font-bold">
                    {analysis.data.win_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vitórias / Derrotas</span>
                  <span className="font-mono">
                    <span className="text-win">{analysis.data.wins}W</span>{" "}
                    <span className="text-loss">{analysis.data.losses}L</span>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
