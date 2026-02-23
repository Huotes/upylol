"use client";

import { severityBg, severityColor } from "@/lib/formatters";
import { SEVERITY_LABELS } from "@/lib/constants";
import type { Diagnostic } from "@/types";

interface DiagnosticCardProps {
  diagnostic: Diagnostic;
  index?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  farming: "🌾",
  fighting: "⚔️",
  vision: "👁️",
  survivability: "🛡️",
  teamplay: "🤝",
  consistency: "📊",
  objectives: "🏰",
  economy: "💰",
  early_game: "🌅",
  mid_game: "⚡",
  late_game: "🌙",
  positioning: "📍",
  itemization: "🔧",
  wave_management: "🌊",
};

const CATEGORY_LABELS: Record<string, string> = {
  farming: "Farm",
  fighting: "Combate",
  vision: "Visao",
  survivability: "Sobrevivencia",
  teamplay: "Jogo em Equipe",
  consistency: "Consistencia",
  objectives: "Objetivos",
  economy: "Economia",
  early_game: "Early Game",
  mid_game: "Mid Game",
  late_game: "Late Game",
  positioning: "Posicionamento",
  itemization: "Itemizacao",
  wave_management: "Controle de Wave",
};

export function DiagnosticCard({ diagnostic, index = 0 }: DiagnosticCardProps) {
  const icon = CATEGORY_ICONS[diagnostic.category] ?? "📋";
  const categoryLabel = CATEGORY_LABELS[diagnostic.category] ?? diagnostic.category;
  const severityLabel = SEVERITY_LABELS[diagnostic.severity] ?? diagnostic.severity;
  const delay = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <div
      className={`animate-fade-in-up ${delay} rounded-lg border p-4 transition-all duration-300 hover:translate-x-1 ${severityBg(diagnostic.severity)}`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className={`text-xs font-bold uppercase tracking-wide ${severityColor(diagnostic.severity)}`}>
          {severityLabel}
        </span>
        <span className="text-xs text-text-secondary">{categoryLabel}</span>

        {/* Data badge if available */}
        {diagnostic.data?.deficit_pct && (
          <span className="ml-auto rounded-full bg-bg-primary/50 px-2 py-0.5 font-mono text-xs text-text-secondary">
            -{diagnostic.data.deficit_pct}%
          </span>
        )}
        {diagnostic.data?.excess_pct && (
          <span className="ml-auto rounded-full bg-bg-primary/50 px-2 py-0.5 font-mono text-xs text-text-secondary">
            +{diagnostic.data.excess_pct}%
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mb-1 text-sm font-semibold text-text-primary">
        {diagnostic.title}
      </h4>

      {/* Description */}
      <p className="mb-3 text-xs leading-relaxed text-text-secondary">
        {diagnostic.description}
      </p>

      {/* Comparison bar (if data has current + benchmark) */}
      {diagnostic.data?.current != null && diagnostic.data?.benchmark != null && diagnostic.data.benchmark > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Voce: <span className="font-mono font-medium text-text-primary">{Number(diagnostic.data.current).toFixed(1)}</span></span>
            <span>Meta ({diagnostic.data.benchmark_tier ?? "Elo"}): <span className="font-mono font-medium text-accent">{Number(diagnostic.data.benchmark).toFixed(1)}</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-primary/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (Number(diagnostic.data.current) / Number(diagnostic.data.benchmark)) * 100)}%`,
                backgroundColor: Number(diagnostic.data.current) >= Number(diagnostic.data.benchmark) * 0.85
                  ? "var(--color-win)"
                  : Number(diagnostic.data.current) >= Number(diagnostic.data.benchmark) * 0.7
                    ? "var(--color-accent-warning)"
                    : "var(--color-loss)",
              }}
            />
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-md bg-bg-primary/50 p-3 border border-border/30">
        <p className="text-xs font-medium text-accent leading-relaxed">
          💡 {diagnostic.recommendation}
        </p>
      </div>
    </div>
  );
}
