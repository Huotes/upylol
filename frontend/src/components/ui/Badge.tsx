import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "win" | "loss" | "accent" | "warning" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]",
  win: "bg-[color-mix(in_srgb,var(--color-win)_15%,transparent)] text-[var(--color-win)] border-[color-mix(in_srgb,var(--color-win)_30%,transparent)]",
  loss: "bg-[color-mix(in_srgb,var(--color-loss)_15%,transparent)] text-[var(--color-loss)] border-[color-mix(in_srgb,var(--color-loss)_30%,transparent)]",
  accent:
    "bg-[color-mix(in_srgb,var(--color-cyan-glow)_15%,transparent)] text-[var(--color-text-accent)] border-[color-mix(in_srgb,var(--color-cyan-glow)_30%,transparent)]",
  warning:
    "bg-[color-mix(in_srgb,var(--color-gold-accent)_15%,transparent)] text-[var(--color-gold-accent)] border-[color-mix(in_srgb,var(--color-gold-accent)_30%,transparent)]",
  muted:
    "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
