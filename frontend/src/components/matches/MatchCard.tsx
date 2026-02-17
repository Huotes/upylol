import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { cn } from "@/lib/cn";
import { formatKDA, formatDuration, formatNumber } from "@/lib/formatters";
import { QUEUE_LABELS } from "@/lib/constants";
import type { MatchData, MatchParticipant } from "@/types";

interface MatchCardProps {
  match: MatchData;
  puuid: string;
}

export function MatchCard({ match, puuid }: MatchCardProps) {
  const participant = match.info.participants.find((p) => p.puuid === puuid);
  if (!participant) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-3 transition-colors",
        participant.win
          ? "border-win/20 bg-win/5"
          : "border-loss/20 bg-loss/5",
      )}
    >
      {/* Result bar */}
      <div
        className={cn(
          "h-14 w-1 rounded-full",
          participant.win ? "bg-win" : "bg-loss",
        )}
      />

      {/* Champion */}
      <Image
        src={ddragon.championIcon(participant.championName)}
        alt={participant.championName}
        width={48}
        height={48}
        className="rounded-lg"
      />

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold", participant.win ? "text-win" : "text-loss")}>
            {participant.win ? "Vitória" : "Derrota"}
          </span>
          <span className="text-xs text-text-secondary">
            {QUEUE_LABELS[match.info.queueId] ?? "Custom"} ·{" "}
            {formatDuration(match.info.gameDuration)}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-sm text-text-primary">
          {formatKDA(participant.kills, participant.deaths, participant.assists)}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden text-right sm:block">
        <p className="font-mono text-xs text-text-secondary">
          {participant.totalMinionsKilled + (participant.neutralMinionsKilled ?? 0)} CS
        </p>
        <p className="font-mono text-xs text-text-secondary">
          {formatNumber(participant.totalDamageDealtToChampions)} DMG
        </p>
      </div>

      {/* Items */}
      <div className="hidden gap-0.5 md:flex">
        {[
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ]
          .filter((id) => id > 0)
          .map((itemId, i) => (
            <Image
              key={`${match.metadata.matchId}-item-${i}`}
              src={ddragon.itemIcon(itemId)}
              alt={`Item ${itemId}`}
              width={28}
              height={28}
              className="rounded"
            />
          ))}
      </div>
    </div>
  );
}
