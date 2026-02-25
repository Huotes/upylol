import { Card } from "@/components/ui/Card";
import { POSITION_NAMES } from "@/lib/constants";
import type { AnalysisResponse } from "@/types";

interface StatsOverviewProps {
  data: AnalysisResponse;
}

interface StatItemProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

function StatItem({ label, value, sub, color }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color ?? "text-text-primary"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const wrColor = data.win_rate >= 50 ? "text-win" : "text-loss";
  const roleName = POSITION_NAMES[data.primary_role] ?? "";

  return (
    <Card className="grid grid-cols-2 gap-6 sm:grid-cols-5">
      <StatItem label="Partidas" value={data.games_analyzed} />
      <StatItem
        label="Win Rate"
        value={`${data.win_rate}%`}
        color={wrColor}
      />
      <StatItem
        label="Vitórias"
        value={data.wins}
        color="text-win"
      />
      <StatItem
        label="Derrotas"
        value={data.losses}
        color="text-loss"
      />
      {roleName && (
        <StatItem
          label="Role Principal"
          value={roleName}
          sub="Benchmarks ajustados"
        />
      )}
    </Card>
  );
}
