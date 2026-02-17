import { cn } from "@/lib/cn";
import { DIMENSION_LABELS } from "@/lib/constants";
import type { DimensionScore } from "@/types";

interface DimensionBarProps {
  dimension: DimensionScore;
}

export function DimensionBar({ dimension }: DimensionBarProps) {
  const label = DIMENSION_LABELS[dimension.name] ?? dimension.name;
  const pct = Math.min(100, Math.max(0, dimension.score));

  const barColor =
    pct >= 70
      ? "bg-emerald-400"
      : pct >= 50
        ? "bg-accent"
        : pct >= 30
          ? "bg-amber-400"
          : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text-primary">{label}</span>
        <div className="flex items-center gap-3 font-mono text-text-secondary">
          <span>
            Você: <span className="text-text-primary">{dimension.raw_value}</span>
          </span>
          {dimension.benchmark > 0 && (
            <span>
              Média elo: <span className="text-text-primary">{dimension.benchmark}</span>
            </span>
          )}
          <span
            className={cn(
              "font-bold",
              pct >= 50 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {Math.round(pct)}
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
