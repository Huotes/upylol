"use client";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants";
import type { Diagnostic } from "@/types/analysis";

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[];
}

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  if (diagnostics.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-win)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-win)_5%,transparent)] p-6 text-center">
        <TrendingUp className="h-8 w-8 text-[var(--color-win)]" />
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-win)]">
            Excelente performance!
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Não foram encontrados pontos críticos de melhoria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {diagnostics.map((diag, i) => (
        <DiagnosticItem key={`${diag.dimension}-${i}`} diagnostic={diag} />
      ))}
    </div>
  );
}

function DiagnosticItem({ diagnostic }: { diagnostic: Diagnostic }) {
  const color = SEVERITY_COLORS[diagnostic.severity];
  const label = SEVERITY_LABELS[diagnostic.severity];

  const SeverityIcon =
    diagnostic.severity === "critical"
      ? AlertTriangle
      : diagnostic.severity === "important"
        ? AlertCircle
        : Info;

  return (
    <div
      className={cn(
        "group rounded-[var(--radius-lg)] border bg-[var(--color-bg-card)] p-4 transition-all hover:bg-[var(--color-bg-hover)]",
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: color,
      }}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {diagnostic.title}
            </h4>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                color,
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
              }}
            >
              {label}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {diagnostic.description}
          </p>

          {/* Comparison bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <span>Você: {diagnostic.player_value.toFixed(1)}</span>
                <span>Benchmark: {diagnostic.benchmark_value.toFixed(1)}</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${Math.min((diagnostic.player_value / diagnostic.benchmark_value) * 100, 100)}%`,
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-[var(--color-text-primary)]"
                  style={{
                    left: `${Math.min((diagnostic.benchmark_value / Math.max(diagnostic.player_value, diagnostic.benchmark_value)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] p-2.5">
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--color-text-accent)]" />
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {diagnostic.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
