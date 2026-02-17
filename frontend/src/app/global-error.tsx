"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#0a0e1a] text-[#f1f5f9]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Algo deu muito errado</h2>
          <p className="mt-2 text-sm text-gray-400">
            {error.message || "Erro inesperado na aplicação."}
          </p>
          <Button onClick={reset} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </body>
    </html>
  );
}
