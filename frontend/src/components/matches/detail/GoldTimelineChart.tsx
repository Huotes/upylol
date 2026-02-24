"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/formatters";
import type { GoldDiffPoint } from "@/types";

interface Props {
  data: GoldDiffPoint[];
  durationMin: number;
}

export function GoldTimelineChart({ data, durationMin }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    min: d.minute,
    gold: d.gold_diff,
  }));

  const maxAbs = Math.max(
    ...chartData.map((d) => Math.abs(d.gold)),
    1000,
  );
  const yDomain = [-maxAbs * 1.1, maxAbs * 1.1];

  return (
    <Card className="stagger-3">
      <CardTitle>Timeline de Ouro</CardTitle>
      <p className="mb-3 text-xs text-text-secondary">
        Diferenca de ouro entre os times ao longo da partida
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="goldPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28c76f" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#28c76f" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="goldNegative" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ea5455" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ea5455" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="min"
            tick={{ fill: "#8888a0", fontSize: 11 }}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: "#8888a0", fontSize: 11 }}
            tickFormatter={(v) => formatNumber(v)}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #2a2a3e",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [
              `${value > 0 ? "+" : ""}${formatNumber(value)} ouro`,
              "Diff",
            ]}
            labelFormatter={(label) => `${label} minutos`}
          />
          <ReferenceLine y={0} stroke="#8888a0" strokeDasharray="3 3" />

          <Area
            type="monotone"
            dataKey="gold"
            stroke="#00f5d4"
            strokeWidth={2}
            fill="url(#goldPositive)"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Phase indicators */}
      <div className="mt-2 flex justify-between text-[10px] text-text-secondary">
        <span>Early (0-15m)</span>
        <span>Mid (15-25m)</span>
        {durationMin >= 25 && <span>Late (25m+)</span>}
      </div>
    </Card>
  );
}
