"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Activity, Stethoscope, TrendingUp } from "lucide-react";
import { useSummoner, useAnalysis } from "@/hooks";
import { parseSummonerName } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { PerformanceRadar } from "@/components/analysis/PerformanceRadar";
import { DimensionScores } from "@/components/analysis/DimensionScores";
import { DiagnosticsPanel } from "@/components/analysis/DiagnosticsPanel";
import { StrengthsWeaknesses } from "@/components/analysis/StrengthsWeaknesses";
import { TrendsList } from "@/components/analysis/TrendsList";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function AnalysisPage({ params }: PageProps) {
  const { region, name } = use(params);
  const { gameName, tagLine } = parseSummonerName(name);

  const { data: summoner } = useSummoner(region, gameName, tagLine);

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
  } = useAnalysis(region, gameName, tagLine);

  if (isLoading) {
    return (
      <Loading
        size="lg"
        text="Analisando performance..."
        className="min-h-[60vh]"
      />
    );
  }

  if (error ?? !analysis) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorState
          title="Erro na análise"
          message="Não foi possível gerar a análise de performance. Tente novamente."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Back link */}
      <Link
        href={`/summoner/${region}/${name}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-text-primary)]">
          Análise de Performance
        </h1>
        <Badge variant="accent">
          <Activity className="h-3 w-3" />
          {analysis.games_analyzed} partidas
        </Badge>
        {analysis.tier_benchmark && (
          <Badge variant="warning">
            Benchmark: {analysis.tier_benchmark}
          </Badge>
        )}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Radar chart — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <BarChart3 className="mr-2 inline h-5 w-5 text-[var(--color-text-accent)]" />
              Radar de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceRadar
              scores={analysis.scores}
              overallScore={analysis.overall_score}
            />
          </CardContent>
        </Card>

        {/* Dimension scores sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Scores por Dimensão</CardTitle>
          </CardHeader>
          <CardContent>
            <DimensionScores scores={analysis.scores} />
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pontos Fortes & Fracos</CardTitle>
          </CardHeader>
          <CardContent>
            <StrengthsWeaknesses
              strengths={analysis.strengths}
              weaknesses={analysis.weaknesses}
            />
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp className="mr-2 inline h-5 w-5 text-[var(--color-text-accent)]" />
              Tendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendsList trends={analysis.trends} />
          </CardContent>
        </Card>

        {/* Diagnostics — full width */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Stethoscope className="mr-2 inline h-5 w-5 text-[var(--color-text-accent)]" />
                Diagnósticos
              </CardTitle>
              {analysis.diagnostics.length > 0 && (
                <Badge
                  variant={
                    analysis.diagnostics.some((d) => d.severity === "critical")
                      ? "loss"
                      : "warning"
                  }
                >
                  {analysis.diagnostics.length} encontrado
                  {analysis.diagnostics.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DiagnosticsPanel diagnostics={analysis.diagnostics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
