import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { cn } from "@/lib/cn";
import { formatWinRate, positionLabel } from "@/lib/formatters";
import type { ChampionPerformance } from "@/types";

interface ChampionGridProps {
  champions: ChampionPerformance[];
}

export function ChampionGrid({ champions }: ChampionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {champions.map((champ, i) => (
        <ChampionGridItem key={champ.champion_name} champion={champ} rank={i + 1} />
      ))}
    </div>
  );
}

function ChampionGridItem({
  champion,
  rank,
}: {
  champion: ChampionPerformance;
  rank: number;
}) {
  const wrColor =
    champion.win_rate >= 55
      ? "text-win"
      : champion.win_rate < 45
        ? "text-loss"
        : "text-text-primary";

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-bg-card-hover">
      <div className="relative shrink-0">
        <Image
          src={ddragon.championIcon(champion.champion_name)}
          alt={champion.champion_name}
          width={56}
          height={56}
          className="rounded-lg"
        />
        <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bg-secondary text-xs font-bold text-text-secondary">
          {rank}
        </span>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{champion.champion_name}</p>
          <p className={cn("text-sm font-bold tabular-nums", wrColor)}>
            {formatWinRate(champion.win_rate)}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span>{champion.games} jogos</span>
          <span>
            {champion.wins ?? 0}W / {champion.losses ?? 0}L
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-text-secondary">
          <span>KDA {champion.avg_kda}</span>
          <span>{champion.avg_cs_per_min} CS/min</span>
          {champion.avg_damage_per_min != null && (
            <span>{Math.round(champion.avg_damage_per_min)} DPM</span>
          )}
        </div>

        {champion.positions.length > 0 && (
          <div className="flex gap-1.5">
            {champion.positions.map((pos) => (
              <span
                key={pos}
                className="rounded bg-border/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary"
              >
                {positionLabel(pos)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
