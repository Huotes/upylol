"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/lib/constants";
import { summonerPath } from "@/lib/utils";

interface SearchBarProps {
  compact?: boolean;
  className?: string;
  defaultRegion?: string;
}

export function SearchBar({
  compact,
  className,
  defaultRegion = "br1",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(defaultRegion);
  const [showRegions, setShowRegions] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const trimmed = query.trim();
      if (!trimmed) return;

      // Parse "Name#TAG" format
      const hashIndex = trimmed.indexOf("#");
      let gameName: string;
      let tagLine: string;

      if (hashIndex !== -1) {
        gameName = trimmed.slice(0, hashIndex).trim();
        tagLine = trimmed.slice(hashIndex + 1).trim();
      } else {
        gameName = trimmed;
        // Default tag based on region
        tagLine = region === "br1" ? "BR1" : region.toUpperCase();
      }

      if (gameName) {
        router.push(summonerPath(region, gameName, tagLine));
      }
    },
    [query, region, router],
  );

  const selectedPlatform = PLATFORMS.find((p) => p.value === region);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        compact ? "max-w-md" : "max-w-2xl",
        className,
      )}
    >
      {/* Region selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowRegions(!showRegions)}
          className={cn(
            "flex items-center gap-1 border border-r-0 border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-accent)] transition-colors hover:bg-[var(--color-bg-hover)]",
            compact
              ? "rounded-l-[var(--radius-md)] px-2.5 py-2"
              : "rounded-l-[var(--radius-xl)] px-4 py-3.5",
          )}
        >
          {selectedPlatform?.label ?? "BR"}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </button>

        {showRegions && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowRegions(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 grid grid-cols-3 gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-1.5 shadow-xl">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setRegion(p.value);
                    setShowRegions(false);
                  }}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-bold transition-colors",
                    region === p.value
                      ? "bg-[var(--color-bg-hover)] text-[var(--color-text-accent)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)]",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={compact ? "Buscar invocador..." : "Nome do Invocador#TAG"}
        className={cn(
          "flex-1 border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] outline-none transition-all",
          "placeholder:text-[var(--color-text-muted)]",
          "focus:border-[var(--color-border-accent)] focus:ring-1 focus:ring-[var(--color-border-accent)]",
          compact ? "py-2 pl-3 pr-9 text-sm" : "py-3.5 pl-4 pr-12 text-base",
        )}
      />

      {/* Search button */}
      <button
        type="submit"
        className={cn(
          "absolute right-0 flex items-center justify-center border-l border-[var(--color-border-default)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-accent)]",
          compact
            ? "right-0 top-0 h-full w-9 rounded-r-[var(--radius-md)] bg-[var(--color-bg-elevated)]"
            : "right-0 top-0 h-full w-12 rounded-r-[var(--radius-xl)] bg-[var(--color-bg-elevated)]",
        )}
      >
        <Search className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </button>
    </form>
  );
}
