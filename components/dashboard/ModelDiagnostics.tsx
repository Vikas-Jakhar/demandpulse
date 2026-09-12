"use client";

import * as React from "react";
import { X, ShieldCheck, Trophy } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import type { DiagnosticsPayload } from "@/types";

interface ModelDiagnosticsProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: DiagnosticsPayload | null;
}

const CANDIDATE_COLORS: Record<string, string> = {
  NAIVE: "#6D7580",
  HOLT_WINTERS_ADDITIVE: "#4FD1C5",
  HOLT_WINTERS_MULTIPLICATIVE: "#F5A623",
  MOVING_AVERAGE: "#8A93A1",
  LINEAR_TREND_BASELINE: "#E5584F",
};

/**
 * The ONLY place in the app a user sees more than one model's numbers at
 * once. Reached exclusively via the "View Audit & Diagnostics" link on the
 * main dashboard's model badge — never the default view, and never linked
 * from anywhere a business user would land first.
 */
export function ModelDiagnostics({ isOpen, onClose, diagnostics }: ModelDiagnosticsProps) {
  if (!isOpen) return null;

  if (!diagnostics) {
    return (
      <DrawerShell onClose={onClose}>
        <p className="p-6 text-sm text-ink-muted">No forecast has been computed yet for this series.</p>
      </DrawerShell>
    );
  }

  const { benchmarks, holdoutWindow } = diagnostics;

  const overlayData = React.useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    for (const b of benchmarks) {
      for (const p of b.holdoutPoints) {
        if (!byDate.has(p.date)) byDate.set(p.date, { date: p.date, actual: p.actual });
        byDate.get(p.date)![b.modelId] = p.predicted;
      }
    }
    return Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [benchmarks]);

  const residualHistogram = React.useMemo(() => {
    const champion = benchmarks.find((b) => b.isChampion);
    if (!champion) return [];
    const residuals = champion.holdoutPoints.map((p) => p.predicted - p.actual);
    const buckets = 8;
    const min = Math.min(...residuals);
    const max = Math.max(...residuals);
    const width = (max - min || 1) / buckets;
    const counts = Array.from({ length: buckets }, (_, i) => ({
      range: `${Math.round(min + i * width)}`,
      count: 0,
    }));
    residuals.forEach((r) => {
      const idx = Math.min(buckets - 1, Math.max(0, Math.floor((r - min) / width)));
      counts[idx].count += 1;
    });
    return counts;
  }, [benchmarks]);

  return (
    <DrawerShell onClose={onClose}>
      <div className="space-y-5 p-5">
        <div className="flex items-start gap-2 rounded border border-border-soft bg-surface-raised p-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-actual" />
          <p className="text-xs text-ink-muted">
            Backtested on a held-out validation window ({holdoutWindow.periods} periods, {holdoutWindow.start} to{" "}
            {holdoutWindow.end}) that no candidate saw during fitting. This view is for audit purposes only — the
            main dashboard always shows just the selected champion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-ink">Benchmark comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-soft text-ink-muted">
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">WAPE</th>
                  <th className="px-4 py-2 font-medium">MAPE</th>
                  <th className="px-4 py-2 font-medium">RMSE</th>
                  <th className="px-4 py-2 font-medium">MAE</th>
                  <th className="px-4 py-2 font-medium">Bias</th>
                  <th className="px-4 py-2 font-medium">Tracking Signal</th>
                  <th className="px-4 py-2 font-medium">Exec. Time</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => (
                  <tr
                    key={b.modelId}
                    className={cn("border-b border-border-soft/60", b.isChampion && "bg-signal/5")}
                  >
                    <td className="flex items-center gap-1.5 px-4 py-2 text-ink">
                      {b.isChampion && <Trophy className="h-3 w-3 text-signal" />}
                      {b.displayName}
                    </td>
                    <td className="px-4 py-2 tabular-nums text-ink">{b.metrics.wape}%</td>
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{b.metrics.mape}%</td>
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{formatNumber(b.metrics.rmse, 1)}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{formatNumber(b.metrics.mae, 1)}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{b.metrics.bias}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{b.metrics.trackingSignal}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-faint">{b.executionTimeMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-ink">Candidate performance vs. holdout actuals</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] p-2 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} minTickGap={40} />
                <YAxis tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} width={44} />
                <Tooltip contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#E8EAED" strokeWidth={2} dot={false} />
                {benchmarks.map((b) => (
                  <Line
                    key={b.modelId}
                    type="monotone"
                    dataKey={b.modelId}
                    name={b.displayName}
                    stroke={CANDIDATE_COLORS[b.modelId] ?? "#8A93A1"}
                    strokeWidth={b.isChampion ? 2.5 : 1.25}
                    strokeDasharray={b.isChampion ? undefined : "3 3"}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-ink">Champion residual distribution (holdout)</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] p-2 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residualHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} />
                <YAxis tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} width={32} />
                <Tooltip contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="#F5A623" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DrawerShell>
  );
}

function DrawerShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl animate-slide-in-right flex-col overflow-y-auto border-l border-border bg-canvas shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-canvas/95 p-4 backdrop-blur">
          <div>
            <h2 className="text-sm font-semibold text-ink">Model Diagnostics & Benchmarks</h2>
            <p className="text-xs text-ink-faint">Audit view — not shown to end business users by default</p>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
