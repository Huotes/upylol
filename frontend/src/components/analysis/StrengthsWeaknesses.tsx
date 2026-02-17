"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { getScoreColor } from "@/lib/utils";
import type { DimensionInsight } from "@/types/analysis";

interface StrengthsWeaknessesProps {
  strengths: DimensionInsight[];
  weaknesses: DimensionInsight[];
}

export function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: StrengthsWeaknessesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Strengths */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-[var(--color-win)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-win)]">
            Pontos Fortes
          </span>
        </div>
        {strengths.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Nenhum ponto forte identificado.
          </p>
        ) : (
          <div className="space-y-1.5">
            {strengths.map((s) => (
              <InsightRow key={s.dimension} insight={s} />
            ))}
          </div>
        )}
      </div>

      {/* Weaknesses */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ThumbsDown className="h-4 w-4 text-[var(--color-loss)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-loss)]">
            Pontos Fracos
          </span>
        </div>
        {weaknesses.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Nenhum ponto fraco identificado.
          </p>
        ) : (
          <div className="space-y-1.5">
            {weaknesses.map((w) => (
              <InsightRow key={w.dimension} insight={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightRow({ insight }: { insight: DimensionInsight }) {
  const color = getScoreColor(insight.score);

  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] px-3 py-2">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {insight.label}
      </span>
      <span className="text-sm font-bold" style={{ color }}>
        {Math.round(insight.score)}
      </span>
    </div>
  );
}
