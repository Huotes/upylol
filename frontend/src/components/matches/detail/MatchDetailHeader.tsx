"use client";

import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { formatDuration } from "@/lib/formatters";
import { QUEUE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { MatchDetailAnalysis } from "@/types";

interface Props {
  analysis: MatchDetailAnalysis;
}

const GRADE_COLORS: Record<string, string> = {
  "S+": "text-amber-300",
  S: "text-amber-400",
  "A+": "text-emerald-300",
  A: "text-emerald-400",
  "B+": "text-sky-300",
  B: "text-sky-400",
  "C+": "text-text-secondary",
  C: "text-text-secondary",
  "D+": "text-red-300",
  D: "text-red-400",
};

export function MatchDetailHeader({ analysis }: Props) {
  const { player, duration_sec, queue_id, game_start_timestamp, performance_grade } = analysis;
  const isWin = player.win;
  const date = new Date(game_start_timestamp);
  const dateStr = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "animate-fade-in rounded-xl border p-5",
        isWin
          ? "border-win/30 bg-win/5"
          : "border-loss/30 bg-loss/5",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Champion + result */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={ddragon.championIcon(player.champion_name)}
              alt={player.champion_name}
              width={64}
              height={64}
              className="rounded-xl border-2 border-border"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).src = ddragon.placeholder;
              }}
            />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-bg-card px-1.5 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
              {player.champion_level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xl font-bold",
                  isWin ? "text-win" : "text-loss",
                )}
              >
                {isWin ? "Vitoria" : "Derrota"}
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-sm font-bold",
                  GRADE_COLORS[performance_grade] ?? "text-text-secondary",
                )}
              >
                {performance_grade}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {QUEUE_LABELS[queue_id] ?? "Custom"} · {formatDuration(duration_sec)} · {dateStr}
            </p>
          </div>
        </div>

        {/* Right: KDA + main stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-text-primary">
              {player.kills}
              <span className="text-text-secondary">/</span>
              <span className="text-loss">{player.deaths}</span>
              <span className="text-text-secondary">/</span>
              {player.assists}
            </p>
            <p className="text-xs text-text-secondary">
              {player.deaths === 0
                ? "Perfect KDA"
                : `${((player.kills + player.assists) / player.deaths).toFixed(2)} KDA`}
            </p>
          </div>

          <div className="hidden h-10 w-px bg-border sm:block" />

          <div className="hidden gap-4 text-center sm:flex">
            <div>
              <p className="font-mono text-sm font-bold">{player.cs}</p>
              <p className="text-[10px] text-text-secondary">{player.cs_per_min} CS/m</p>
            </div>
            <div>
              <p className="font-mono text-sm font-bold">{Math.round(player.damage_per_min)}</p>
              <p className="text-[10px] text-text-secondary">DPM</p>
            </div>
            <div>
              <p className="font-mono text-sm font-bold">{player.vision_score}</p>
              <p className="text-[10px] text-text-secondary">Visao</p>
            </div>
            <div>
              <p className="font-mono text-sm font-bold">{player.kill_participation}%</p>
              <p className="text-[10px] text-text-secondary">KP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
