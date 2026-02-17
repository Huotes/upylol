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

  return (
    <Card className="flex items-center gap-5">
      <div className="relative">
        <Image
          src={ddragon.profileIcon(player.profile_icon_id)}
          alt="Profile icon"
          width={80}
          height={80}
          className="rounded-xl border-2 border-border"
        />
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full
                     bg-bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums"
        >
          {player.summoner_level}
        </span>
      </div>

      <div className="flex-1">
        <h1 className="text-2xl font-bold">
          {player.game_name}
          <span className="text-text-secondary">#{player.tag_line}</span>
        </h1>

        <div className="mt-1 flex items-center gap-3">
          <span
            className="rounded-md px-2 py-0.5 text-sm font-bold"
            style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
          >
            {formatTier(ranked.tier, ranked.rank)}
          </span>

          {ranked.tier !== "UNRANKED" && (
            <>
              <span className="text-sm text-text-secondary">
                {ranked.lp} LP
              </span>
              <span className="text-sm text-text-secondary">
                {ranked.wins}W {ranked.losses}L
              </span>
              <span
                className={`text-sm font-medium ${
                  ranked.win_rate >= 50 ? "text-win" : "text-loss"
                }`}
              >
                {formatWinRate(ranked.win_rate)}
              </span>
              {ranked.hot_streak && (
                <span className="text-xs text-accent-warning">🔥 Hot Streak</span>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
