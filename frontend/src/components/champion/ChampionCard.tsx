"use client";

import Image from "next/image";
import { cn, getWinRateColor, getKDAColor } from "@/lib/utils";
import { getChampionIconUrl } from "@/lib/constants";
import type { ChampionPerformance } from "@/types/champion";

interface ChampionCardProps {
  champion: ChampionPerformance;
  rank?: number;
  compact?: boolean;
}

export function ChampionCard({
  champion,
  rank,
  compact,
}: ChampionCardProps) {
  const kda = champion.avg_kda;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] p-2.5 transition-colors hover:bg-[var(--color-bg-hover)]">
        <div className="relative h-8 w-8 overflow-hidden rounded-md">
          <Image
            src={getChampionIconUrl(champion.champion_name)}
            alt={champion.champion_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {champion.champion_name}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {champion.games} jogos
        </span>
        <span
          className={cn(
            "text-xs font-bold",
            getWinRateColor(champion.win_rate),
          )}
        >
          {champion.win_rate.toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div className="group rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-4 transition-all card-hover">
      <div className="flex items-center gap-3">
        {/* Rank number */}
        {rank !== undefined && (
          <span
            className={cn(
              "font-[family-name:var(--font-display)] text-2xl font-black",
              rank === 1
                ? "text-[var(--color-gold-accent)]"
                : rank === 2
                  ? "text-[var(--color-rank-silver)]"
                  : rank === 3
                    ? "text-[var(--color-rank-bronze)]"
                    : "text-[var(--color-text-muted)]",
            )}
          >
            {rank}
          </span>
        )}

        {/* Champion icon */}
        <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-2 ring-[var(--color-border-subtle)]">
          <Image
            src={getChampionIconUrl(champion.champion_name)}
            alt={champion.champion_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Champion info */}
        <div className="min-w-0 flex-1">
          <div className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-text-primary)]">
            {champion.champion_name}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {champion.games} partidas — {champion.wins}V {champion.losses}D
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end gap-0.5">
          <span
            className={cn(
              "text-lg font-bold",
              getWinRateColor(champion.win_rate),
            )}
          >
            {champion.win_rate.toFixed(1)}%
          </span>
          <span className={cn("text-xs font-bold", getKDAColor(kda))}>
            {kda.toFixed(2)} KDA
          </span>
        </div>
      </div>

      {/* Extra stats */}
      <div className="mt-3 flex gap-4 border-t border-[var(--color-border-subtle)] pt-3">
        <Stat label="CS/min" value={champion.avg_cs_per_min.toFixed(1)} />
        <Stat label="DPM" value={champion.avg_damage_per_min.toFixed(0)} />
        <Stat
          label="K/D/A"
          value={`${champion.avg_kills.toFixed(1)}/${champion.avg_deaths.toFixed(1)}/${champion.avg_assists.toFixed(1)}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
        {value}
      </span>
    </div>
  );
}
