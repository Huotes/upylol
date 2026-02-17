import { severityBg, severityColor } from "@/lib/formatters";
import type { Diagnostic } from "@/types";

interface DiagnosticCardProps {
  diagnostic: Diagnostic;
}

export function DiagnosticCard({ diagnostic }: DiagnosticCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${severityBg(diagnostic.severity)}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`text-xs font-bold uppercase ${severityColor(diagnostic.severity)}`}
        >
          {diagnostic.severity}
        </span>
        <span className="text-xs text-text-secondary">
          {diagnostic.category}
        </span>
      </div>

      <h4 className="mb-1 text-sm font-semibold text-text-primary">
        {diagnostic.title}
      </h4>

      <p className="mb-3 text-xs leading-relaxed text-text-secondary">
        {diagnostic.description}
      </p>

      <div className="rounded-md bg-bg-primary/50 p-3">
        <p className="text-xs font-medium text-accent">
          💡 {diagnostic.recommendation}
        </p>
      </div>
    </div>
  );
}
