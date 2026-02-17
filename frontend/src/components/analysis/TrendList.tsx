import { trendIndicator } from "@/lib/formatters";
import { DIMENSION_LABELS } from "@/lib/constants";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Trend } from "@/types";

interface TrendListProps {
  trends: Trend[];
}

const METRIC_LABELS: Record<string, string> = {
  cs_per_min: "CS/min",
  kda: "KDA",
  vision_per_min: "Visão/min",
  deaths: "Mortes",
  damage_per_min: "DPM",
  ...DIMENSION_LABELS,
};

export function TrendList({ trends }: TrendListProps) {
  if (trends.length === 0) return null;

  return (
    <Card>
      <CardTitle>Tendências Recentes</CardTitle>
      <div className="space-y-3">
        {trends.map((t) => {
          const { icon, color } = trendIndicator(t.trend);
          return (
            <div
              key={t.metric}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-text-secondary">
                {METRIC_LABELS[t.metric] ?? t.metric}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">
                  {t.early_avg} → {t.recent_avg}
                </span>
                <span className={`font-bold ${color}`}>
                  {icon} {t.change_pct > 0 ? "+" : ""}
                  {t.change_pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
