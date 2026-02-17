import { cn } from "@/lib/cn";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

/** SVG circular progress indicator for performance scores */
export function ScoreRing({
  score,
  size = 100,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-accent"
        : score >= 30
          ? "stroke-amber-400"
          : "stroke-red-400";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-1000", color)}
        />
      </svg>
      <span className="absolute text-xl font-bold tabular-nums">
        {Math.round(score)}
      </span>
      {label && (
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      )}
    </div>
  );
}
