"use client";

import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { PlayerSearch } from "@/components/search/PlayerSearch";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function PlayerError({ error, reset }: ErrorProps) {
  return (
    <div className="space-y-8">
      <PlayerSearch className="mx-auto" />
      <ErrorDisplay
        title="Erro ao carregar jogador"
        message={error.message || "Não foi possível carregar os dados do jogador."}
        onRetry={reset}
      />
    </div>
  );
}
