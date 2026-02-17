"use client";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Erro",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-4xl text-accent-secondary">⚠</div>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="max-w-md text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-bold
                     text-bg-primary transition-all hover:brightness-110"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
