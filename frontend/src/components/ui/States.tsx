"use client";

import { AlertTriangle, SearchX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-loss)_15%,transparent)]">
        <AlertTriangle className="h-7 w-7 text-[var(--color-loss)]" />
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = "Nada encontrado",
  message = "Não há dados para exibir.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]">
        <SearchX className="h-7 w-7 text-[var(--color-text-muted)]" />
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{message}</p>
      </div>
    </div>
  );
}
