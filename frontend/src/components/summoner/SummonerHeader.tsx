"use client";

import Image from "next/image";
import { Trophy, Flame, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatRank, formatWinRate, getWinRateColor } from "@/lib/utils";
import { getProfileIconUrl, TIER_COLORS } from "@/lib/constants";
import type { SummonerProfile, LeagueEntry } from "@/types/summoner";

interface SummonerHeaderProps {
  summoner: SummonerProfile;
}

export function SummonerHeader({ summoner }: SummonerHeaderProps) {
  const soloQueue = summoner.leagues.find(
    (l) => l.queue_type === "RANKED_SOLO_5x5",
  );
  const flexQueue = summoner.leagues.find(
    (l) => l.queue_type === "RANKED_FLEX_SR",
  );

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
      {/* Background gradient based on rank */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: soloQueue
            ? `radial-gradient(ellipse at top, ${TIER_COLORS[soloQueue.tier] ?? "var(--color-cyan-glow)"}, transparent 70%)`
            : "radial-gradient(ellipse at top, var(--color-cyan-glow), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-start">
        {/* Profile icon + level */}
        <div className="relative flex-shrink-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[var(--color-border-default)]">
            <Image
              src={getProfileIconUrl(summoner.profile_icon_id)}
              alt="Profile Icon"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-bg-elevated)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-text-accent)] ring-2 ring-[var(--color-bg-card)]">
            {summoner.summoner_level}
          </span>
        </div>

        {/* Name + tags */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {summoner.game_name}
            </h1>
            <span className="text-lg font-medium text-[var(--color-text-muted)]">
              #{summoner.tag_line}
            </span>
          </div>

          {/* Rank badges */}
          <div className="mt-3 flex flex-wrap gap-3">
            {soloQueue && <RankDisplay queue={soloQueue} label="Solo/Duo" />}
            {flexQueue && <RankDisplay queue={flexQueue} label="Flex" />}
            {!soloQueue && !flexQueue && (
              <Badge variant="muted">Unranked</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Individual rank display */
function RankDisplay({
  queue,
  label,
}: {
  queue: LeagueEntry;
  label: string;
}) {
  const total = queue.wins + queue.losses;
  const winRate = total > 0 ? (queue.wins / total) * 100 : 0;
  const rankColor = TIER_COLORS[queue.tier] ?? "var(--color-text-secondary)";

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-2.5">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </span>
        <span
          className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight"
          style={{ color: rankColor }}
        >
          {formatRank(queue.tier, queue.rank)}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-bold text-[var(--color-text-accent)]">
          {queue.league_points} LP
        </span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[var(--color-text-muted)]">
            {queue.wins}W {queue.losses}L
          </span>
          <span className={cn("font-bold", getWinRateColor(winRate))}>
            {formatWinRate(queue.wins, queue.losses)}
          </span>
        </div>
      </div>
      {queue.hot_streak && (
        <Flame className="h-4 w-4 text-[var(--color-gold-accent)]" />
      )}
    </div>
  );
}
