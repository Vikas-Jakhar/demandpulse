"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChampionModelBadge } from "@/components/dashboard/ChampionModelBadge";
import type { ForecastPoint } from "@/types";
import { formatNumber } from "@/lib/utils";

interface ForecastChartProps {
  points: ForecastPoint[];
  seriesKey: string;
  showBand: "80" | "95" | "none";
  championDisplayName: string;
  forecastReliabilityPct: number;
  onViewDiagnostics: () => void;
}

export function ForecastChart({
  points,
  seriesKey,
  showBand,
  championDisplayName,
  forecastReliabilityPct,
  onViewDiagnostics,
}: ForecastChartProps) {
  const today = points.find((p) => p.forecast !== null)?.date;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-ink">Historical vs. projected demand — {seriesKey}</CardTitle>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <LegendDot color="bg-actual" label="Historical" />
            <LegendDot color="bg-forecast" label="Projected" />
          </div>
        </div>
        <ChampionModelBadge
          championDisplayName={championDisplayName}
          forecastReliabilityPct={forecastReliabilityPct}
          onViewDiagnostics={onViewDiagnostics}
        />
      </CardHeader>
      <CardContent className="h-[420px] p-2 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8A93A1", fontSize: 11 }}
              axisLine={{ stroke: "#232A34" }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: "#8A93A1", fontSize: 11 }}
              axisLine={{ stroke: "#232A34" }}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "#171C24",
                border: "1px solid #232A34",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#E8EAED" }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />

            {showBand === "95" && (
              <Area
                dataKey="upper95"
                stroke="none"
                fill="#F5A623"
                fillOpacity={0.08}
                isAnimationActive={false}
                connectNulls
              />
            )}
            {showBand === "95" && (
              <Area
                dataKey="lower95"
                stroke="none"
                fill="#0C0F13"
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls
              />
            )}
            {showBand !== "none" && (
              <Area
                dataKey="upper80"
                stroke="none"
                fill="#F5A623"
                fillOpacity={0.18}
                isAnimationActive={false}
                connectNulls
              />
            )}
            {showBand !== "none" && (
              <Area
                dataKey="lower80"
                stroke="none"
                fill="#0C0F13"
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls
              />
            )}

            {today && (
              <ReferenceLine x={today} stroke="#5B6472" strokeDasharray="4 4" label={{ value: "Today", fill: "#8A93A1", fontSize: 10, position: "top" }} />
            )}

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#4FD1C5"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="Historical"
            />
            <Line
              type="monotone"
              dataKey="fitted"
              stroke="#5B6472"
              strokeWidth={1.5}
              strokeDasharray="2 3"
              dot={false}
              connectNulls={false}
              name="Model fit"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#F5A623"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="Projected"
            />

            <Brush
              dataKey="date"
              height={24}
              stroke="#232A34"
              fill="#12161C"
              travellerWidth={8}
              tickFormatter={() => ""}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}
