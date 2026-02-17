"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendData } from "@/types/analysis";

interface TrendsListProps {
  trends: TrendData[];
}

export function TrendsList({ trends }: TrendsListProps) {
  if (trends.length === 0) return null;

  const improving = trends.filter((t) => t.trending === "improving");
  const declining = trends.filter((t) => t.trending === "declining");
  const stable = trends.filter((t) => t.trending === "stable");

  return (
    <div className="space-y-4">
      {improving.length > 0 && (
        <TrendGroup
          title="Melhorando"
          trends={improving}
          icon={<TrendingUp className="h-4 w-4 text-[var(--color-win)]" />}
          color="var(--color-win)"
        />
      )}
      {declining.length > 0 && (
        <TrendGroup
          title="Piorando"
          trends={declining}
          icon={<TrendingDown className="h-4 w-4 text-[var(--color-loss)]" />}
          color="var(--color-loss)"
        />
      )}
      {stable.length > 0 && (
        <TrendGroup
          title="Estável"
          trends={stable}
          icon={<Minus className="h-4 w-4 text-[var(--color-text-muted)]" />}
          color="var(--color-text-muted)"
        />
      )}
    </div>
  );
}

function TrendGroup({
  title,
  trends,
  icon,
  color,
}: {
  title: string;
  trends: TrendData[];
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </span>
      </div>
      <div className="space-y-1.5">
        {trends.map((trend) => (
          <div
            key={trend.dimension}
            className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] px-3 py-2"
          >
            <span className="text-sm text-[var(--color-text-secondary)]">
              {trend.dimension}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-muted)]">
                {trend.early_score.toFixed(0)} → {trend.recent_score.toFixed(0)}
              </span>
              <span
                className={cn("text-xs font-bold")}
                style={{ color }}
              >
                {trend.delta > 0 ? "+" : ""}
                {trend.delta.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
