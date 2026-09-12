"use client";

import * as React from "react";
import { X, History as HistoryIcon, Trash2, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import { CANDIDATE_MODEL_REGISTRY } from "@/types";

interface ForecastHistoryEntry {
  id: string;
  datasetId: string;
  sku: string;
  horizon: number;
  confidenceLevel: number;
  selectedModel: keyof typeof CANDIDATE_MODEL_REGISTRY;
  selectedModelDisplayName: string;
  mape: number | null;
  wape: number | null;
  safetyStock: number | null;
  reorderPoint: number | null;
  leadTimeDays: number | null;
  createdAt: string;
}

interface ForecastHistoryDetail extends ForecastHistoryEntry {
  points: { date: string; predictedDemand: number; lowerBound: number; upperBound: number }[];
}

interface ForecastHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string | null;
}

/**
 * Deliberately minimal, same spirit as SavedDatasetsList: this proves the
 * Phase 6 persistence is actually reachable (list → view → delete), not a
 * full analytics-history product. A loaded run shows only the projected
 * line and its one persisted confidence band — ForecastPoint's schema
 * doesn't carry the historical actual/fitted overlay a live run has (see
 * the comment in lib/forecasting/persist.ts), so this is intentionally a
 * lighter view than the main dashboard chart, not a bug.
 */
export function ForecastHistoryDrawer({ isOpen, onClose, datasetId }: ForecastHistoryDrawerProps) {
  const [entries, setEntries] = React.useState<ForecastHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<ForecastHistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setDetail(null);
    setIsLoading(true);
    const query = datasetId ? `?datasetId=${encodeURIComponent(datasetId)}` : "";
    fetch(`/api/forecasts${query}`)
      .then((res) => (res.ok ? res.json() : { forecasts: [] }))
      .then((data) => setEntries(data.forecasts))
      .finally(() => setIsLoading(false));
  }, [isOpen, datasetId]);

  const handleSelect = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/forecasts/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setDetail(data.forecast);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/forecasts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((f) => f.id !== id));
      if (detail?.id === id) setDetail(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl animate-slide-in-right flex-col overflow-y-auto border-l border-border bg-canvas shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-canvas/95 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4 text-signal" />
            <div>
              <h2 className="text-sm font-semibold text-ink">Forecast History</h2>
              <p className="text-xs text-ink-faint">
                {datasetId ? "Saved runs for this dataset" : "All saved runs"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-xs text-ink-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading history…
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <p className="p-4 text-xs text-ink-faint">
              No saved forecast runs yet. Runs are saved automatically once you're signed in with a real
              account and working with a saved dataset.
            </p>
          )}

          {!isLoading && entries.length > 0 && (
            <Card>
              <CardContent className="space-y-1 p-2">
                {entries.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelect(f.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-surface-raised"
                  >
                    <span className="flex-1 truncate text-ink">
                      {f.sku} <span className="text-ink-faint">· {f.selectedModelDisplayName}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {f.wape != null ? `WAPE ${f.wape}%` : "—"} · {f.horizon}d ·{" "}
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(f.id, e)}
                      className="shrink-0 rounded p-1 text-ink-faint hover:bg-bad/10 hover:text-bad"
                      aria-label="Delete forecast"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {detailLoading && (
            <div className="flex items-center gap-2 p-4 text-xs text-ink-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading run…
            </div>
          )}

          {detail && !detailLoading && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <Stat label="Model" value={detail.selectedModelDisplayName} />
                  <Stat label="WAPE" value={detail.wape != null ? `${detail.wape}%` : "—"} />
                  <Stat
                    label="Safety stock"
                    value={detail.safetyStock != null ? formatNumber(detail.safetyStock) : "—"}
                  />
                  <Stat
                    label="Reorder point"
                    value={detail.reorderPoint != null ? formatNumber(detail.reorderPoint) : "—"}
                  />
                </div>

                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detail.points}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#8A93A1", fontSize: 10 }}
                        axisLine={{ stroke: "#232A34" }}
                        tickLine={false}
                        minTickGap={40}
                      />
                      <YAxis tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} width={44} />
                      <Tooltip
                        contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 6, fontSize: 12 }}
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Area dataKey="upperBound" stroke="none" fill="#F5A623" fillOpacity={0.12} isAnimationActive={false} />
                      <Area dataKey="lowerBound" stroke="none" fill="#0C0F13" fillOpacity={1} isAnimationActive={false} />
                      <Line type="monotone" dataKey="predictedDemand" stroke="#F5A623" strokeWidth={2} dot={false} name="Projected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-ink-faint">
                  Showing the {formatPercent(detail.confidenceLevel * 100, 0)} band as saved. Historical
                  actuals aren't stored per forecast run — only the projection.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-faint">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}
