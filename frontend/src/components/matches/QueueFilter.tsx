"use client";

import { cn } from "@/lib/cn";
import { QUEUE_LABELS } from "@/lib/constants";

interface QueueFilterProps {
  selected: number | undefined;
  onChange: (queue: number | undefined) => void;
}

const FILTER_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "Todas", value: undefined },
  { label: "Ranked Solo", value: 420 },
  { label: "Ranked Flex", value: 440 },
  { label: "ARAM", value: 450 },
];

export function QueueFilter({ selected, onChange }: QueueFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            selected === opt.value
              ? "bg-accent/15 text-accent"
              : "bg-border/30 text-text-secondary hover:text-text-primary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
