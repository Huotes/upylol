"use client";

import { cn } from "@/lib/cn";

const ROLES = [
  { value: "", label: "Auto" },
  { value: "TOP", label: "Top" },
  { value: "JUNGLE", label: "Jungle" },
  { value: "MIDDLE", label: "Mid" },
  { value: "BOTTOM", label: "ADC" },
  { value: "UTILITY", label: "Support" },
] as const;

interface RoleFilterProps {
  value: string;
  detectedRole?: string;
  onChange: (role: string) => void;
  loading?: boolean;
}

export function RoleFilter({ value, detectedRole, onChange, loading }: RoleFilterProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-bg-secondary p-1">
      {ROLES.map((r) => {
        const isActive = value === r.value;
        const isDetected = r.value === detectedRole && value === "";
        return (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            disabled={loading}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-accent text-bg-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
              isDetected && !isActive && "ring-1 ring-accent/40",
              loading && "opacity-50 cursor-not-allowed",
            )}
            title={
              r.value === ""
                ? `Detectado: ${detectedRole ?? "—"}`
                : `Comparar benchmarks como ${r.label}`
            }
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
