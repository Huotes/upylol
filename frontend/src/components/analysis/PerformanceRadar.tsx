"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSION_LABELS } from "@/lib/constants";
import type { DimensionScore } from "@/types";

interface PerformanceRadarProps {
  dimensions: DimensionScore[];
}

export function PerformanceRadar({ dimensions }: PerformanceRadarProps) {
  const data = dimensions.map((d) => ({
    name: DIMENSION_LABELS[d.name] ?? d.name,
    score: Math.round(d.score),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#2a2a3e" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: "#8888a0", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#555", fontSize: 10 }}
        />
        <Radar
          name="Performance"
          dataKey="score"
          stroke="#00f5d4"
          fill="#00f5d4"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a2e",
            border: "1px solid #2a2a3e",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
