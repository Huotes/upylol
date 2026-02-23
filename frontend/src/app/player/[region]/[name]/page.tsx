"use client";

import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useAnalysis } from "@/hooks/useAnalysis";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PerformanceRadar } from "@/components/analysis/PerformanceRadar";
import { DiagnosticCard } from "@/components/analysis/DiagnosticCard";
import { GameCountSelector } from "@/components/analysis/GameCountSelector";
import { TrendList } from "@/components/analysis/TrendList";
import { ChampionCard } from "@/components/champions/ChampionCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Card, CardTitle } from "@/components/ui/Card";
import { ProfileSkeleton, RadarSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { PlayerSearch } from "@/components/search/PlayerSearch";
import { DIMENSION_LABELS } from "@/lib/constants";
import type { GameCount } from "@/types";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function PlayerPage({ params }: PageProps) {
  const { region, name } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const [gameCount, setGameCount] = useState<GameCount>(30);

  const player = usePlayer(region, gameName, tag);
  const analysis = useAnalysis(region, gameName, tag, gameCount);

  if (player.isLoading) {
    return (
      <div className="space-y-4">
        <ProfileSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RadarSkeleton />
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
          title="Jogador nao encontrado"
          message={`Nao foi possivel encontrar "${gameName}#${tag}" na regiao ${region}.`}
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

      {/* Game count filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Visao Geral
        </h2>
        <GameCountSelector
          value={gameCount}
          onChange={setGameCount}
          loading={analysis.isFetching}
        />
      </div>

      {analysis.isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <RadarSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {analysis.data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Radar + Diagnostics */}
          <div className="space-y-4 lg:col-span-2">
            {/* Performance Score Card */}
            <Card className="stagger-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="mb-0">Performance Score</CardTitle>
                  <p className="text-xs text-text-secondary mt-1">
                    Baseado em {analysis.data.games_analyzed} partidas analisadas
                  </p>
                </div>
                <ScoreRing
                  score={analysis.data.performance.overall_score}
                  size={80}
                />
              </div>

              <PerformanceRadar dimensions={analysis.data.performance.dimensions} />

              {/* Strengths & Weaknesses */}
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.data.performance.strengths.map((s) => (
                  <span
                    key={s}
                    className="animate-scale-in rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400"
                  >
                    + {DIMENSION_LABELS[s] ?? s}
                  </span>
                ))}
                {analysis.data.performance.weaknesses.map((w) => (
                  <span
                    key={w}
                    className="animate-scale-in rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400"
                  >
                    - {DIMENSION_LABELS[w] ?? w}
                  </span>
                ))}
              </div>
            </Card>

            {/* Diagnostics */}
            {analysis.data.diagnostics.length > 0 && (
              <Card className="stagger-3">
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="mb-0">Diagnostico de Melhorias</CardTitle>
                  <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-medium text-accent-secondary">
                    {analysis.data.diagnostics.length} pontos
                  </span>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  Problemas identificados comparando com jogadores do seu elo
                </p>
                <div className="space-y-3">
                  {analysis.data.diagnostics.map((d, i) => (
                    <DiagnosticCard
                      key={`${d.category}-${i}`}
                      diagnostic={d}
                      index={i}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Summary card */}
            <Card className="stagger-2">
              <CardTitle>Resumo</CardTitle>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Partidas</span>
                  <span className="font-mono font-bold text-lg">
                    {analysis.data.games_analyzed}
                  </span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Win Rate</span>
                  <span
                    className={`font-mono font-bold text-lg ${
                      analysis.data.win_rate >= 50 ? "text-win" : "text-loss"
                    }`}
                  >
                    {analysis.data.win_rate}%
                  </span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">V / D</span>
                  <span className="font-mono">
                    <span className="text-win font-bold">{analysis.data.wins}W</span>
                    {" "}
                    <span className="text-loss font-bold">{analysis.data.losses}L</span>
                  </span>
                </div>
                {/* Win rate bar */}
                <div className="h-2 rounded-full bg-loss/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-win transition-all duration-1000"
                    style={{
                      width: `${analysis.data.games_analyzed > 0 ? (analysis.data.wins / analysis.data.games_analyzed) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Best Champions */}
            <Card className="stagger-3">
              <CardTitle>Melhores Campeoes</CardTitle>
              <div className="space-y-2">
                {analysis.data.best_champions.slice(0, 5).map((champ, i) => (
                  <ChampionCard
                    key={champ.champion_name}
                    champion={champ}
                    rank={i + 1}
                  />
                ))}
              </div>
            </Card>

            {/* Trends */}
            <div className="stagger-4">
              <TrendList trends={analysis.data.trends} />
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay when refetching with new count */}
      {analysis.isFetching && !analysis.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm">
          <div className="animate-scale-in rounded-xl bg-bg-card border border-border p-6 text-center">
            <div className="animate-spin mx-auto mb-3 h-8 w-8 rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-text-secondary">
              Analisando {gameCount === 100 ? "temporada completa" : `${gameCount} partidas`}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
