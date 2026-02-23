import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function Card({ children, className, animate = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-card p-5 transition-all duration-300",
        "hover:border-border/80 hover:shadow-lg hover:shadow-accent/5",
        animate && "animate-fade-in-up",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("mb-3 text-lg font-semibold text-text-primary", className)}>
      {children}
    </h3>
  );
}
