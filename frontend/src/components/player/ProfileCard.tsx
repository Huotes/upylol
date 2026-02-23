"use client";

import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { formatTier, formatWinRate } from "@/lib/formatters";
import { TIER_COLORS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import type { PlayerProfile } from "@/types";

interface ProfileCardProps {
  player: PlayerProfile;
}

export function ProfileCard({ player }: ProfileCardProps) {
  const { ranked } = player;
  const tierColor = TIER_COLORS[ranked.tier] ?? TIER_COLORS.UNRANKED;
  const winRate = ranked.wins + ranked.losses > 0 ? ranked.win_rate : 0;

  return (
    <Card className="relative overflow-hidden stagger-1">
      {/* Gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${tierColor}, transparent)` }}
      />

      <div className="flex items-center gap-5">
        {/* Profile icon */}
        <div className="relative">
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
          <h1 className="text-2xl font-bold truncate">
            {player.game_name}
            <span className="text-text-secondary">#{player.tag_line}</span>
          </h1>

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
                  <span className="text-win font-medium">{ranked.wins}W</span>{" "}
                  <span className="text-loss font-medium">{ranked.losses}L</span>
                </span>
                <span className={`text-sm font-bold ${winRate >= 50 ? "text-win" : "text-loss"}`}>
                  {formatWinRate(winRate)}
                </span>
                {ranked.hot_streak && (
                  <span className="animate-glow-pulse rounded-full bg-accent-warning/20 px-2 py-0.5 text-xs font-bold text-accent-warning">
                    HOT STREAK
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
