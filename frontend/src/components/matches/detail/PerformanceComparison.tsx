"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { BenchmarkStat } from "@/types";

interface Props {
  stats: Record<string, BenchmarkStat>;
}

const STAT_LABELS: Record<string, { label: string; unit: string }> = {
  cs_per_min: { label: "CS/min", unit: "" },
  damage_per_min: { label: "Dano/min", unit: "" },
  gold_per_min: { label: "Ouro/min", unit: "" },
  vision_per_min: { label: "Visao/min", unit: "" },
  deaths: { label: "Mortes", unit: "" },
  kill_participation: { label: "KP", unit: "%" },
};

const STATUS_CONFIG = {
  above: { color: "text-win", bg: "bg-win/10 border-win/20", icon: "↑" },
  at: { color: "text-text-secondary", bg: "bg-bg-primary/50 border-border/30", icon: "→" },
  below: { color: "text-loss", bg: "bg-loss/10 border-loss/20", icon: "↓" },
};

function StatCard({ name, stat }: { name: string; stat: BenchmarkStat }) {
  const meta = STAT_LABELS[name];
  if (!meta) return null;

  // For deaths, "below" benchmark is actually good
  const isDeaths = name === "deaths";
  const effectiveStatus = isDeaths
    ? stat.status === "above" ? "below" : stat.status === "below" ? "above" : "at"
    : stat.status;

  const config = STATUS_CONFIG[effectiveStatus];
  const pct = isDeaths
    ? Math.max(0, 200 - stat.percentile) // Invert for deaths
    : Math.min(stat.percentile, 150);
  const barWidth = Math.min(100, (pct / 150) * 100);

  return (
    <div
      className={cn(
        "animate-fade-in-up rounded-lg border p-3 transition-all hover:translate-y-[-1px]",
        config.bg,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-primary">
          {meta.label}
        </span>
        <span className={cn("text-xs font-bold", config.color)}>
          {config.icon} {stat.diff > 0 ? "+" : ""}{stat.diff.toFixed(1)}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={cn("font-mono text-lg font-bold", config.color)}>
          {typeof stat.value === "number"
            ? Number.isInteger(stat.value)
              ? stat.value
              : stat.value.toFixed(1)
            : stat.value}
        </span>
        <span className="text-[10px] text-text-secondary">{meta.unit}</span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-text-secondary">
        <span>Meta {stat.tier}: {stat.benchmark.toFixed(1)}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-1.5 h-1 rounded-full bg-bg-primary/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor:
              effectiveStatus === "above"
                ? "var(--color-win)"
                : effectiveStatus === "at"
                  ? "var(--color-accent-warning)"
                  : "var(--color-loss)",
          }}
        />
      </div>
    </div>
  );
}

export function PerformanceComparison({ stats }: Props) {
  const statNames = Object.keys(stats);
  if (statNames.length === 0) return null;

  return (
    <Card className="stagger-2">
      <CardTitle>Performance vs Benchmark</CardTitle>
      <p className="mb-3 text-xs text-text-secondary">
        Comparacao com a media do seu elo nesta partida
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {statNames.map((name) => (
          <StatCard key={name} name={name} stat={stats[name]} />
        ))}
      </div>
    </Card>
  );
}
