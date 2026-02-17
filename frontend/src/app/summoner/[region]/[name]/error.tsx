"use client";

import { ErrorState } from "@/components/ui/States";

export default function SummonerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <ErrorState
        title="Erro inesperado"
        message={error.message || "Ocorreu um erro ao carregar esta página."}
        onRetry={reset}
      />
    </div>
  );
}
