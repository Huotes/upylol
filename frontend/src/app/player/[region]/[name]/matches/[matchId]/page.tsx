"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import { ProfileCard } from "@/components/player/ProfileCard";
import { PlayerNav } from "@/components/player/PlayerNav";
import {
  MatchDetailHeader,
  TeamScoreboard,
  PerformanceComparison,
  GoldTimelineChart,
  ObjectivesTimeline,
  DeathAnalysis,
  ImprovementPoints,
} from "@/components/matches/detail";
import { Card, CardTitle } from "@/components/ui/Card";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

interface PageProps {
  params: Promise<{ region: string; name: string; matchId: string }>;
}

export default function MatchDetailPage({ params }: PageProps) {
  const { region, name, matchId } = use(params);
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? "BR1";
  const gameName = decodeURIComponent(name);

  const player = usePlayer(region, gameName, tag);
  const tier = player.data?.ranked?.tier ?? "SILVER";

  const detail = useMatchDetail(
    matchId,
    player.data?.puuid ?? "",
    region,
    tier,
  );

  // Loading state
  if (player.isLoading || detail.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (player.isError || !player.data) {
    return (
      <ErrorDisplay
        title="Jogador nao encontrado"
        message={`"${gameName}#${tag}" nao encontrado.`}
        onRetry={() => player.refetch()}
      />
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="space-y-6">
        <ProfileCard player={player.data} platform={region} />
        <ErrorDisplay
          title="Partida nao encontrada"
          message="Nao foi possivel carregar os detalhes desta partida."
          onRetry={() => detail.refetch()}
        />
      </div>
    );
  }

  const { analysis } = detail.data;

  return (
    <div className="space-y-6">
      <ProfileCard player={player.data} platform={region} />
      <PlayerNav region={region} name={gameName} tag={tag} />

      {/* Back to matches link */}
      <Link
        href={`/player/${region}/${encodeURIComponent(gameName)}/matches?tag=${encodeURIComponent(tag)}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors"
      >
        ← Voltar para partidas
      </Link>

      {/* Match header */}
      <MatchDetailHeader analysis={analysis} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Main analysis */}
        <div className="space-y-6 lg:col-span-2">
          {/* Performance vs Benchmark */}
          <PerformanceComparison stats={analysis.stats_vs_benchmark} />

          {/* Gold Timeline */}
          {analysis.gold_diff_timeline.length > 0 && (
            <GoldTimelineChart
              data={analysis.gold_diff_timeline}
              durationMin={analysis.duration_min}
            />
          )}

          {/* Phase Stats */}
          {analysis.phase_stats.length > 0 && (
            <Card className="stagger-3">
              <CardTitle>Performance por Fase</CardTitle>
              <div className="grid grid-cols-3 gap-3">
                {analysis.phase_stats.map((phase) => {
                  const phaseLabels = {
                    early: "Early (0-15m)",
                    mid: "Mid (15-25m)",
                    late: "Late (25m+)",
                  };

                  return (
                    <div
                      key={phase.phase}
                      className="rounded-lg bg-bg-primary/50 p-3 text-center"
                    >
                      <p className="text-xs font-semibold text-text-primary mb-2">
                        {phaseLabels[phase.phase] ?? phase.phase}
                      </p>
                      <p className="font-mono text-sm text-text-primary">
                        {phase.kills}/{phase.deaths}/{phase.assists}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {phase.cs_per_min} CS/m · {Math.round(phase.gold_per_min)} G/m
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Death Analysis */}
          <DeathAnalysis deaths={analysis.deaths} />

          {/* Objectives */}
          <ObjectivesTimeline
            objectives={analysis.objectives}
            allyDragons={analysis.ally_dragons}
            enemyDragons={analysis.enemy_dragons}
            allyBarons={analysis.ally_barons}
            enemyBarons={analysis.enemy_barons}
            allyHeralds={analysis.ally_heralds}
            enemyHeralds={analysis.enemy_heralds}
            allyTowers={analysis.ally_towers}
            enemyTowers={analysis.enemy_towers}
          />
        </div>

        {/* Right column: Sidebar */}
        <div className="space-y-6">
          {/* Team Scoreboard */}
          <TeamScoreboard
            playerTeam={analysis.player_team}
            enemyTeam={analysis.enemy_team}
            playerPuuid={player.data.puuid}
          />

          {/* Improvement Points */}
          <ImprovementPoints points={analysis.improvement_points} />
        </div>
      </div>
    </div>
  );
}
