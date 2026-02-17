"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <ErrorDisplay
        title="Algo deu errado"
        message={error.message || "Um erro inesperado aconteceu. Tente novamente."}
        onRetry={reset}
      />
    </div>
  );
}
