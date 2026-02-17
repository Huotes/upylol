"use client";

import { ScoreBar } from "@/components/ui/ScoreBar";
import { DIMENSIONS } from "@/types/analysis";
import type { PerformanceScores } from "@/types/analysis";

interface DimensionScoresProps {
  scores: PerformanceScores;
}

export function DimensionScores({ scores }: DimensionScoresProps) {
  const sorted = [...DIMENSIONS].sort(
    (a, b) => scores[b.key] - scores[a.key],
  );

  return (
    <div className="space-y-3">
      {sorted.map((dim) => (
        <ScoreBar
          key={dim.key}
          value={scores[dim.key]}
          label={dim.label}
          showValue
        />
      ))}
    </div>
  );
}
