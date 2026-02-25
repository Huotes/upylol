"use client";

import { useState } from "react";
import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { formatTier, formatWinRate } from "@/lib/formatters";
import { TIER_COLORS, POSITION_NAMES } from "@/lib/constants";
import { useSeasonStats } from "@/hooks/useSeasonStats";
import { Card } from "@/components/ui/Card";
import type { PlayerProfile } from "@/types";

/* ── Role icon SVG paths (simple lane icons) ─────── */
const ROLE_ICONS: Record<string, string> = {
  TOP: "M4 2h6v6H4zM2 4v16h16V4",
  JUNGLE: "M12 2L2 22h20L12 2z",
  MIDDLE: "M2 2l20 20M22 2L2 22",
  BOTTOM: "M4 16h16v6H4zM2 4v16h16V4",
  UTILITY: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a3 3 0 110 6 3 3 0 010-6z",
};

interface ProfileCardProps {
  player: PlayerProfile;
  platform?: string;
}

export function ProfileCard({ player, platform }: ProfileCardProps) {
  const { ranked } = player;
  const tierColor = TIER_COLORS[ranked.tier] ?? TIER_COLORS.UNRANKED;

  const [season, setSeason] = useState("current");

  const resolvedPlatform = platform || player.platform || "br1";
  const seasonStats = useSeasonStats(
    resolvedPlatform,
    player.game_name,
    player.tag_line,
    season,
  );

  // Use season stats when loaded, otherwise fall back to ranked data
  const stats = seasonStats.data;
  const displayWins = stats?.wins ?? ranked.wins;
  const displayLosses = stats?.losses ?? ranked.losses;
  const displayWinRate = stats?.win_rate ?? ranked.win_rate;
  const displayRole = stats?.primary_role ?? "";
  const seasons = stats?.available_seasons ?? [];

  const roleName = POSITION_NAMES[displayRole] ?? "";

  return (
    <Card className="relative overflow-hidden stagger-1">
      {/* Gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${tierColor}, transparent)` }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Profile icon */}
        <div className="relative flex-shrink-0 self-start">
          <Image
            src={ddragon.profileIcon(player.profile_icon_id)}
            alt="Profile icon"
            width={80}
            height={80}
            className="rounded-xl border-2 border-border transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ddragon.placeholder;
            }}
            unoptimized
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums border border-border">
            {player.summoner_level}
          </span>
        </div>

        {/* Name + Ranked info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold truncate sm:text-2xl">
              {player.game_name}
              <span className="text-text-secondary">#{player.tag_line}</span>
            </h1>

            {/* Role badge */}
            {roleName && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent-primary/10 px-2 py-0.5 text-xs font-semibold text-accent-primary">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 fill-current"
                  aria-hidden="true"
                >
                  <path d={ROLE_ICONS[displayRole] ?? ""} />
                </svg>
                {roleName}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {ranked.tier !== "UNRANKED" && (
              <Image
                src={ddragon.rankedEmblem(ranked.tier)}
                alt={ranked.tier}
                width={24}
                height={24}
                className="inline-block"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}

            <span
              className="rounded-md px-2.5 py-0.5 text-sm font-bold"
              style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
            >
              {formatTier(ranked.tier, ranked.rank)}
            </span>

            {ranked.tier !== "UNRANKED" && (
              <>
                <span className="text-sm font-mono text-text-secondary">{ranked.lp} LP</span>
                <span className="hidden sm:inline text-xs text-border">|</span>
                <span className="text-sm text-text-secondary">
                  <span className="text-win font-medium">{displayWins}W</span>{" "}
                  <span className="text-loss font-medium">{displayLosses}L</span>
                </span>
                <span className={`text-sm font-bold ${displayWinRate >= 50 ? "text-win" : "text-loss"}`}>
                  {formatWinRate(displayWinRate)}
                </span>
                {ranked.hot_streak && season === "current" && (
                  <span className="animate-glow-pulse rounded-full bg-accent-warning/20 px-2 py-0.5 text-xs font-bold text-accent-warning">
                    HOT STREAK
                  </span>
                )}
              </>
            )}
          </div>

          {/* Season filter */}
          {ranked.tier !== "UNRANKED" && (
            <div className="mt-2 flex items-center gap-2">
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="rounded-md border border-border bg-bg-secondary px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                <option value="current">Temporada Atual</option>
                {seasons.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>

              {seasonStats.isFetching && (
                <span className="text-xs text-text-secondary animate-pulse">
                  Carregando...
                </span>
              )}

              {stats && season !== "current" && (
                <span className="text-xs text-text-secondary">
                  {stats.games_played} partidas
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
