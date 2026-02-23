"use client";

import { cn } from "@/lib/cn";
import { GAME_COUNT_OPTIONS, type GameCount } from "@/types";

interface GameCountSelectorProps {
  value: GameCount;
  onChange: (count: GameCount) => void;
  loading?: boolean;
}

export function GameCountSelector({ value, onChange, loading }: GameCountSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-bg-secondary p-1">
      {GAME_COUNT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={loading}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
            value === opt.value
              ? "bg-accent text-bg-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
            loading && "opacity-50 cursor-not-allowed",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
