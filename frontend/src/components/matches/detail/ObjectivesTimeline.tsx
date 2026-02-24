"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ObjectiveEvent } from "@/types";

interface Props {
  objectives: ObjectiveEvent[];
  allyDragons: number;
  enemyDragons: number;
  allyBarons: number;
  enemyBarons: number;
  allyHeralds: number;
  enemyHeralds: number;
  allyTowers: number;
  enemyTowers: number;
}

const OBJ_ICONS: Record<string, string> = {
  dragon: "🐉",
  baron: "👾",
  herald: "🦀",
  tower: "🏰",
  inhibitor: "💎",
};

const DRAGON_NAMES: Record<string, string> = {
  fire: "Fogo",
  water: "Agua",
  earth: "Terra",
  air: "Vento",
  hextech: "Hextech",
  chemtech: "Chemtech",
  elder: "Ancestral",
  unknown: "Dragao",
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ObjectivesTimeline({
  objectives,
  allyDragons,
  enemyDragons,
  allyBarons,
  enemyBarons,
  allyHeralds,
  enemyHeralds,
  allyTowers,
  enemyTowers,
}: Props) {
  // Filter to main objectives (skip towers for timeline, show in summary)
  const mainObjectives = objectives.filter(
    (o) => o.event_type !== "tower" && o.event_type !== "inhibitor",
  );

  return (
    <Card className="stagger-4">
      <CardTitle>Objetivos</CardTitle>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-bg-primary/50 p-2">
          <p className="text-xs text-text-secondary">Dragoes</p>
          <p className="font-mono text-sm">
            <span className="text-win font-bold">{allyDragons}</span>
            <span className="text-text-secondary"> vs </span>
            <span className="text-loss font-bold">{enemyDragons}</span>
          </p>
        </div>
        <div className="rounded-lg bg-bg-primary/50 p-2">
          <p className="text-xs text-text-secondary">Baron</p>
          <p className="font-mono text-sm">
            <span className="text-win font-bold">{allyBarons}</span>
            <span className="text-text-secondary"> vs </span>
            <span className="text-loss font-bold">{enemyBarons}</span>
          </p>
        </div>
        <div className="rounded-lg bg-bg-primary/50 p-2">
          <p className="text-xs text-text-secondary">Herald</p>
          <p className="font-mono text-sm">
            <span className="text-win font-bold">{allyHeralds}</span>
            <span className="text-text-secondary"> vs </span>
            <span className="text-loss font-bold">{enemyHeralds}</span>
          </p>
        </div>
        <div className="rounded-lg bg-bg-primary/50 p-2">
          <p className="text-xs text-text-secondary">Torres</p>
          <p className="font-mono text-sm">
            <span className="text-win font-bold">{allyTowers}</span>
            <span className="text-text-secondary"> vs </span>
            <span className="text-loss font-bold">{enemyTowers}</span>
          </p>
        </div>
      </div>

      {/* Timeline */}
      {mainObjectives.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-text-secondary mb-2">
            Timeline de Objetivos
          </p>
          {mainObjectives.map((obj, i) => {
            const isAlly = obj.team === "ally";
            const icon = OBJ_ICONS[obj.event_type] ?? "📍";
            const name =
              obj.event_type === "dragon"
                ? DRAGON_NAMES[obj.subtype] ?? obj.subtype
                : obj.event_type === "baron"
                  ? "Baron Nashor"
                  : obj.event_type === "herald"
                    ? "Rift Herald"
                    : obj.subtype;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-1.5 text-xs",
                  isAlly
                    ? "bg-win/5 border-l-2 border-win"
                    : "bg-loss/5 border-l-2 border-loss",
                )}
              >
                <span className="font-mono text-text-secondary w-12">
                  {formatTime(obj.timestamp_sec)}
                </span>
                <span className="text-base">{icon}</span>
                <span className="font-medium text-text-primary">{name}</span>
                <span
                  className={cn(
                    "ml-auto text-[10px] font-semibold",
                    isAlly ? "text-win" : "text-loss",
                  )}
                >
                  {isAlly ? "Seu Time" : "Inimigo"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {mainObjectives.length === 0 && (
        <p className="text-center text-xs text-text-secondary py-4">
          Dados de timeline nao disponiveis para esta partida
        </p>
      )}
    </Card>
  );
}
