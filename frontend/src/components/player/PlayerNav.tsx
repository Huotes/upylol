"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface PlayerNavProps {
  region: string;
  name: string;
  tag: string;
}

const TABS = [
  { label: "Visão Geral", path: "" },
  { label: "Análise", path: "/analysis" },
  { label: "Campeões", path: "/champions" },
  { label: "Partidas", path: "/matches" },
] as const;

export function PlayerNav({ region, name, tag }: PlayerNavProps) {
  const pathname = usePathname();
  const base = `/player/${region}/${encodeURIComponent(name)}`;

  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-bg-secondary p-1">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}?tag=${encodeURIComponent(tag)}`;
        const isActive =
          tab.path === ""
            ? pathname === base
            : pathname.endsWith(tab.path);

        return (
          <Link
            key={tab.path}
            href={href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
