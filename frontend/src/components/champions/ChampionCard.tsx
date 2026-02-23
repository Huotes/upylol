"use client";

import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { formatWinRate, positionLabel } from "@/lib/formatters";
import type { ChampionPerformance } from "@/types";

interface ChampionCardProps {
  champion: ChampionPerformance;
  rank?: number;
}

export function ChampionCard({ champion, rank }: ChampionCardProps) {
  const wrColor =
    champion.win_rate >= 55
      ? "text-win"
      : champion.win_rate < 45
        ? "text-loss"
        : "text-text-primary";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-card p-3 transition-all duration-200 hover:bg-bg-card-hover hover:translate-x-0.5">
      {rank !== undefined && (
        <span className="w-6 text-center font-mono text-sm font-bold text-text-secondary">
          {rank}
        </span>
      )}

      <Image
        src={ddragon.championIcon(champion.champion_name)}
        alt={champion.champion_name}
        width={44}
        height={44}
        className="rounded-lg border border-border"
        unoptimized
        onError={(e) => {
          (e.target as HTMLImageElement).src = ddragon.placeholder;
        }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{champion.champion_name}</p>
        <p className="text-xs text-text-secondary">
          {champion.games} games ·{" "}
          {champion.positions.map(positionLabel).join(" / ")}
        </p>
      </div>

      <div className="text-right">
        <p className={`text-sm font-bold ${wrColor}`}>
          {formatWinRate(champion.win_rate)}
        </p>
        <p className="font-mono text-xs text-text-secondary">
          KDA {champion.avg_kda} · {champion.avg_cs_per_min} CS
        </p>
      </div>
    </div>
  );
}
