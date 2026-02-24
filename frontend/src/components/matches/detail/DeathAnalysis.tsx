"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { DeathEvent } from "@/types";

interface Props {
  deaths: DeathEvent[];
}

const PHASE_CONFIG = {
  early: { label: "Early", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  mid: { label: "Mid", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  late: { label: "Late", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DeathAnalysis({ deaths }: Props) {
  if (deaths.length === 0) {
    return (
      <Card className="stagger-4">
        <CardTitle>Analise de Mortes</CardTitle>
        <div className="py-6 text-center">
          <span className="text-2xl">🎉</span>
          <p className="mt-2 text-sm font-medium text-win">
            Nenhuma morte nesta partida!
          </p>
          <p className="text-xs text-text-secondary">
            Performance perfeita em sobrevivencia
          </p>
        </div>
      </Card>
    );
  }

  // Summary by phase
  const earlyDeaths = deaths.filter((d) => d.game_phase === "early").length;
  const midDeaths = deaths.filter((d) => d.game_phase === "mid").length;
  const lateDeaths = deaths.filter((d) => d.game_phase === "late").length;

  return (
    <Card className="stagger-4">
      <div className="flex items-center justify-between mb-1">
        <CardTitle className="mb-0">Analise de Mortes</CardTitle>
        <span className="rounded-full bg-loss/20 px-2 py-0.5 text-xs font-bold text-loss">
          {deaths.length} mortes
        </span>
      </div>

      {/* Phase summary */}
      <div className="mb-4 flex gap-2">
        {earlyDeaths > 0 && (
          <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-xs font-medium text-sky-400">
            Early: {earlyDeaths}
          </span>
        )}
        {midDeaths > 0 && (
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            Mid: {midDeaths}
          </span>
        )}
        {lateDeaths > 0 && (
          <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium text-red-400">
            Late: {lateDeaths}
          </span>
        )}
      </div>

      {/* Death list */}
      <div className="space-y-1.5">
        {deaths.map((death, i) => {
          const phase = PHASE_CONFIG[death.game_phase] ?? PHASE_CONFIG.mid;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 text-xs",
                phase.bg,
                phase.border,
              )}
            >
              <span className="font-mono text-text-secondary w-12">
                {formatTime(death.timestamp_sec)}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  phase.bg,
                  phase.color,
                )}
              >
                {phase.label}
              </span>
              <span className="flex-1 text-text-primary">
                {death.description}
              </span>
              {death.num_enemies >= 3 && (
                <span className="rounded bg-loss/20 px-1.5 py-0.5 text-[10px] font-bold text-loss">
                  {death.num_enemies}v1
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
