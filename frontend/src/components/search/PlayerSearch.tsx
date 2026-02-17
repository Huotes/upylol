"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { REGION_LABELS, type Region } from "@/types";

const REGIONS = Object.entries(REGION_LABELS) as [Region, string][];

export function PlayerSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [region, setRegion] = useState<Region>("br1");
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parts = riotId.split("#");
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      setError("Use o formato: Nome#Tag (ex: Player#BR1)");
      return;
    }

    const [gameName, tagLine] = parts.map((s) => s.trim());
    router.push(
      `/player/${region}/${encodeURIComponent(gameName)}?tag=${encodeURIComponent(tagLine)}`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full max-w-2xl", className)}>
      <div className="flex gap-2">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          className="rounded-lg border border-border bg-bg-card px-3 py-3 text-sm
                     font-medium text-text-primary outline-none transition-colors
                     focus:border-accent"
        >
          {REGIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="Nome#Tag (ex: Faker#KR1)"
            className="w-full rounded-lg border border-border bg-bg-card px-4 py-3
                       text-base text-text-primary outline-none transition-colors
                       placeholder:text-text-secondary focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-bold
                     text-bg-primary transition-all hover:brightness-110
                     active:scale-95"
        >
          Buscar
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-accent-secondary">{error}</p>
      )}
    </form>
  );
}
