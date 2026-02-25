"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useAnalysis } from "@/hooks/useAnalysis";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import { PerformanceRadar } from "@/components/analysis/PerformanceRadar";
import { DimensionBar } from "@/components/analysis/DimensionBar";
import { DiagnosticCard } from "@/components/analysis/DiagnosticCard";
import { StatsOverview } from "@/components/analysis/StatsOverview";
import { TrendList } from "@/components/analysis/TrendList";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Card, CardTitle } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function AnalysisPage({ params }: PageProps) {
  const { region, name } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const player = usePlayer(region, gameName, tag);
  const analysis = useAnalysis(region, gameName, tag, 50);

  if (player.isLoading || analysis.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (player.isError || !player.data) {
    return (
      <ErrorDisplay
        title="Jogador não encontrado"
        message={`Não foi possível carregar "${gameName}#${tag}".`}
        onRetry={() => player.refetch()}
      />
    );
  }

  if (analysis.isError || !analysis.data) {
    return (
      <ErrorDisplay
        title="Erro na análise"
        message="Não foi possível gerar a análise de performance."
        onRetry={() => analysis.refetch()}
      />
    );
  }

  const { performance, diagnostics, trends } = analysis.data;

  return (
    <div className="space-y-6">
      <ProfileCard player={player.data} platform={region} />
      <PlayerNav region={region} name={gameName} tag={tag} />

      <StatsOverview data={analysis.data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar */}
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Radar de Performance</CardTitle>
            <div className="relative flex items-center justify-center">
              <ScoreRing score={performance.overall_score} size={80} />
            </div>
          </div>
          <PerformanceRadar dimensions={performance.dimensions} />
        </Card>

        {/* Dimension detail bars */}
        <Card>
          <CardTitle>Detalhamento por Dimensão</CardTitle>
          <div className="space-y-4">
            {performance.dimensions.map((d) => (
              <DimensionBar key={d.name} dimension={d} />
            ))}
          </div>
        </Card>
      </div>

      {/* Diagnostics */}
      {diagnostics.length > 0 && (
        <Card>
          <CardTitle>
            Diagnóstico de Melhorias ({diagnostics.length})
          </CardTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {diagnostics.map((d, i) => (
              <DiagnosticCard key={`${d.category}-${i}`} diagnostic={d} />
            ))}
          </div>
        </Card>
      )}

      {/* Trends */}
      <TrendList trends={trends} />

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-emerald-400">Pontos Fortes</CardTitle>
          {performance.strengths.length > 0 ? (
            <ul className="space-y-2">
              {performance.strengths.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-sm text-text-primary"
                >
                  <span className="text-emerald-400">✓</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              Nenhum ponto forte identificado. Jogue mais partidas.
            </p>
          )}
        </Card>

        <Card>
          <CardTitle className="text-red-400">Pontos Fracos</CardTitle>
          {performance.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {performance.weaknesses.map((w) => (
                <li
                  key={w}
                  className="flex items-center gap-2 text-sm text-text-primary"
                >
                  <span className="text-red-400">✗</span> {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              Nenhum ponto fraco crítico identificado. Continue assim!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
