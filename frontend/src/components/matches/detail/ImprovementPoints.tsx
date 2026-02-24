"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { severityBg, severityColor } from "@/lib/formatters";
import { SEVERITY_LABELS } from "@/lib/constants";
import type { ImprovementPoint } from "@/types";

interface Props {
  points: ImprovementPoint[];
}

const CATEGORY_ICONS: Record<string, string> = {
  deaths: "💀",
  farming: "🌾",
  vision: "👁️",
  objectives: "🐉",
  fighting: "⚔️",
  positioning: "📍",
};

export function ImprovementPoints({ points }: Props) {
  if (points.length === 0) {
    return (
      <Card className="stagger-5">
        <CardTitle>Pontos de Melhoria</CardTitle>
        <div className="py-6 text-center">
          <span className="text-2xl">⭐</span>
          <p className="mt-2 text-sm font-medium text-accent">
            Excelente partida!
          </p>
          <p className="text-xs text-text-secondary">
            Nenhum ponto critico de melhoria identificado
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="stagger-5">
      <div className="flex items-center justify-between mb-1">
        <CardTitle className="mb-0">Pontos de Melhoria</CardTitle>
        <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-medium text-accent-secondary">
          {points.length} pontos
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-4">
        O que voce poderia ter feito melhor nesta partida
      </p>

      <div className="space-y-3">
        {points.map((point, i) => {
          const icon = CATEGORY_ICONS[point.category] ?? "📋";
          const sevLabel = SEVERITY_LABELS[point.severity] ?? point.severity;

          return (
            <div
              key={i}
              className={`animate-fade-in-up rounded-lg border p-3 ${severityBg(point.severity)}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${severityColor(point.severity)}`}
                >
                  {sevLabel}
                </span>
              </div>

              <h4 className="mb-1 text-xs font-semibold text-text-primary">
                {point.title}
              </h4>

              <p className="mb-2 text-[11px] leading-relaxed text-text-secondary">
                {point.description}
              </p>

              <div className="rounded-md bg-bg-primary/50 p-2 border border-border/30">
                <p className="text-[11px] font-medium text-accent leading-relaxed">
                  💡 {point.recommendation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
