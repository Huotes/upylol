"use client";

import Image from "next/image";
import { cn, formatDuration, formatTimeAgo, formatKDA, getKDAColor } from "@/lib/utils";
import { getChampionIconUrl, getItemIconUrl, QUEUE_NAMES, POSITION_NAMES } from "@/lib/constants";
import type { MatchSummary } from "@/types/match";

interface MatchHistoryProps {
  matches: MatchSummary[];
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
        Nenhuma partida encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <MatchRow key={match.match_id} match={match} />
      ))}
    </div>
  );
}

function MatchRow({ match }: { match: MatchSummary }) {
  const p = match.participant;
  const kda = p.deaths === 0 ? p.kills + p.assists : (p.kills + p.assists) / p.deaths;
  const kdaStr = formatKDA(p.kills, p.deaths, p.assists);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-lg)] border bg-[var(--color-bg-card)] p-3 transition-all hover:bg-[var(--color-bg-hover)]",
        p.win
          ? "border-l-[3px] border-l-[var(--color-win)] border-t-[var(--color-border-default)] border-r-[var(--color-border-default)] border-b-[var(--color-border-default)]"
          : "border-l-[3px] border-l-[var(--color-loss)] border-t-[var(--color-border-default)] border-r-[var(--color-border-default)] border-b-[var(--color-border-default)]",
      )}
    >
      {/* Champion icon */}
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={getChampionIconUrl(p.champion_name)}
          alt={p.champion_name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Champion + queue + position info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-[var(--color-text-primary)]">
            {p.champion_name}
          </span>
          <span
            className={cn(
              "text-xs font-bold",
              p.win ? "text-[var(--color-win)]" : "text-[var(--color-loss)]",
            )}
          >
            {p.win ? "Vitória" : "Derrota"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          <span>{QUEUE_NAMES[match.queue_id] ?? "Normal"}</span>
          <span>·</span>
          <span>{POSITION_NAMES[p.team_position] ?? p.team_position}</span>
          <span>·</span>
          <span>{formatDuration(match.game_duration)}</span>
        </div>
      </div>

      {/* KDA */}
      <div className="text-center">
        <div className="text-sm font-bold text-[var(--color-text-primary)]">
          {p.kills}/{p.deaths}/{p.assists}
        </div>
        <div className={cn("text-xs font-bold", getKDAColor(kda))}>
          {kdaStr} KDA
        </div>
      </div>

      {/* CS + Vision */}
      <div className="hidden text-center sm:block">
        <div className="text-sm text-[var(--color-text-primary)]">
          {p.cs} CS ({p.cs_per_min.toFixed(1)}/min)
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          VS {p.vision_score}
        </div>
      </div>

      {/* Items */}
      <div className="hidden gap-0.5 md:flex">
        {p.items.slice(0, 6).map((itemId, i) => (
          <div key={i} className="h-7 w-7 overflow-hidden rounded bg-[var(--color-bg-elevated)]">
            {itemId > 0 && (
              <Image
                src={getItemIconUrl(itemId)}
                alt={`Item ${itemId}`}
                width={28}
                height={28}
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        ))}
      </div>

      {/* Time ago */}
      <div className="hidden flex-shrink-0 text-right lg:block">
        <span className="text-xs text-[var(--color-text-muted)]">
          {formatTimeAgo(match.game_start_timestamp)}
        </span>
      </div>
    </div>
  );
}
