"use client";

import Image from "next/image";
import { ddragon } from "@/lib/ddragon";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { Card, CardTitle } from "@/components/ui/Card";
import type { ParticipantDetail } from "@/types";

interface Props {
  playerTeam: ParticipantDetail[];
  enemyTeam: ParticipantDetail[];
  playerPuuid: string;
}

function ParticipantRow({
  p,
  isPlayer,
}: {
  p: ParticipantDetail;
  isPlayer: boolean;
}) {
  const items = p.items.filter((id) => id > 0);
  const kda =
    p.deaths === 0
      ? "Perfect"
      : ((p.kills + p.assists) / p.deaths).toFixed(1);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
        isPlayer
          ? "bg-accent/10 border border-accent/20"
          : "hover:bg-bg-primary/50",
      )}
    >
      {/* Champion */}
      <Image
        src={ddragon.championIcon(p.champion_name)}
        alt={p.champion_name}
        width={28}
        height={28}
        className="rounded-md"
        unoptimized
        onError={(e) => {
          (e.target as HTMLImageElement).src = ddragon.placeholder;
        }}
      />

      {/* Name */}
      <span
        className={cn(
          "w-24 truncate font-medium",
          isPlayer ? "text-accent" : "text-text-primary",
        )}
      >
        {p.summoner_name || p.champion_name}
      </span>

      {/* KDA */}
      <span className="w-20 text-center font-mono text-text-primary">
        {p.kills}/{p.deaths}/{p.assists}
        <span className="ml-1 text-text-secondary">({kda})</span>
      </span>

      {/* CS */}
      <span className="w-12 text-center font-mono text-text-secondary">
        {p.cs}
      </span>

      {/* Damage */}
      <span className="hidden w-14 text-center font-mono text-text-secondary sm:block">
        {formatNumber(p.damage_dealt)}
      </span>

      {/* Gold */}
      <span className="hidden w-14 text-center font-mono text-text-secondary md:block">
        {formatNumber(p.gold_earned)}
      </span>

      {/* Vision */}
      <span className="hidden w-10 text-center font-mono text-text-secondary lg:block">
        {p.vision_score}
      </span>

      {/* Items */}
      <div className="ml-auto hidden gap-0.5 xl:flex">
        {items.slice(0, 6).map((itemId, i) => {
          const src = ddragon.itemIcon(itemId);
          if (!src) return null;
          return (
            <Image
              key={i}
              src={src}
              alt={`Item ${itemId}`}
              width={22}
              height={22}
              className="rounded"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function TeamHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
      <span className="w-7" />
      <span className="w-24">{label}</span>
      <span className="w-20 text-center">KDA</span>
      <span className="w-12 text-center">CS</span>
      <span className="hidden w-14 text-center sm:block">DMG</span>
      <span className="hidden w-14 text-center md:block">Gold</span>
      <span className="hidden w-10 text-center lg:block">Visao</span>
    </div>
  );
}

export function TeamScoreboard({ playerTeam, enemyTeam, playerPuuid }: Props) {
  const allyWin = playerTeam[0]?.win ?? false;

  return (
    <Card>
      <CardTitle>Placar da Partida</CardTitle>

      {/* Ally team */}
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              allyWin ? "bg-win" : "bg-loss",
            )}
          />
          <span className="text-xs font-semibold text-text-primary">
            Seu Time {allyWin ? "(Vitoria)" : "(Derrota)"}
          </span>
        </div>
        <TeamHeader label="Jogador" />
        <div className="space-y-0.5">
          {playerTeam.map((p) => (
            <ParticipantRow
              key={p.puuid}
              p={p}
              isPlayer={p.puuid === playerPuuid}
            />
          ))}
        </div>
      </div>

      {/* Enemy team */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              !allyWin ? "bg-win" : "bg-loss",
            )}
          />
          <span className="text-xs font-semibold text-text-primary">
            Time Inimigo {!allyWin ? "(Vitoria)" : "(Derrota)"}
          </span>
        </div>
        <TeamHeader label="Jogador" />
        <div className="space-y-0.5">
          {enemyTeam.map((p) => (
            <ParticipantRow key={p.puuid} p={p} isPlayer={false} />
          ))}
        </div>
      </div>
    </Card>
  );
}
