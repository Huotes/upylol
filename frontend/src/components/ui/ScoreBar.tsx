"use client";

import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/utils";

interface ScoreBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ScoreBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  className,
}: ScoreBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = getScoreColor(value);

  return (
    <div className={cn("w-full", className)}>
      {(label ?? showValue) && (
        <div className="mb-1 flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showValue && (
            <span
              className="text-xs font-bold"
              style={{ color }}
            >
              {Math.round(value)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
