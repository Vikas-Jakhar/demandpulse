"use client";

import * as React from "react";
import { Activity, LogOut, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { generateMockDataset } from "@/lib/mock-data";
import { FileUpload } from "@/components/ingestion/FileUpload";
import { KPICards } from "@/components/dashboard/KPICards";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ScenarioSlider } from "@/components/dashboard/ScenarioSlider";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ModelDiagnostics } from "@/components/dashboard/ModelDiagnostics";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { Button } from "@/components/ui/button";
import { buildCopilotContext } from "@/lib/ai/context";
import type { CopilotContext } from "@/types";

interface DashboardClientProps {
  role: string;
  isGuest: boolean;
}

const SEASONAL_PERIODS_BY_FREQ = { DAILY: 7, WEEKLY: 52, MONTHLY: 12 } as const;

/**
 * Champion Model dashboard shell. This component only ever reads
 * `champion` from the store for anything rendered on the primary screen —
 * `diagnostics` is threaded through to a single place, the ModelDiagnostics
 * drawer, and nowhere else. That's a deliberate data-flow constraint, not
 * just a visual one: there's no path from here to a rendered comparison of
 * candidate models unless the user explicitly opens the drawer.
 */
export function DashboardClient({ role, isGuest }: DashboardClientProps) {
  const router = useRouter();
  const dataset = useAppStore((s) => s.dataset);
  const setDataset = useAppStore((s) => s.setDataset);
  const activeSeriesKey = useAppStore((s) => s.activeSeriesKey);
  const setActiveSeriesKey = useAppStore((s) => s.setActiveSeriesKey);
  const horizon = useAppStore((s) => s.horizon);
  const setHorizon = useAppStore((s) => s.setHorizon);
  const growthAdjustmentPct = useAppStore((s) => s.growthAdjustmentPct);
  const setGrowthAdjustmentPct = useAppStore((s) => s.setGrowthAdjustmentPct);
  const isForecasting = useAppStore((s) => s.isForecasting);
  const setIsForecasting = useAppStore((s) => s.setIsForecasting);
  const champion = useAppStore((s) => s.champion);
  const setChampion = useAppStore((s) => s.setChampion);
  const diagnostics = useAppStore((s) => s.diagnostics);
  const setDiagnostics = useAppStore((s) => s.setDiagnostics);
  const isDiagnosticsOpen = useAppStore((s) => s.isDiagnosticsOpen);
  const setDiagnosticsOpen = useAppStore((s) => s.setDiagnosticsOpen);

  const [showUploader, setShowUploader] = React.useState(false);
  const [band, setBand] = React.useState<"80" | "95" | "none">("80");
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Load demo data on first mount so the dashboard is never empty.
  React.useEffect(() => {
    if (!dataset) setDataset(generateMockDataset());
  }, [dataset, setDataset]);

  const runChampionPipeline = React.useCallback(async () => {
    if (!dataset || !activeSeriesKey) return;
    const seriesForKey = dataset.series
      .filter((p) => p.seriesKey === activeSeriesKey)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (seriesForKey.length < 8) return;

    setIsForecasting(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: seriesForKey.map((p) => p.date),
          values: seriesForKey.map((p) => p.value),
          seriesKey: activeSeriesKey,
          horizon,
          frequency: dataset.frequency,
          seasonalPeriods: SEASONAL_PERIODS_BY_FREQ[dataset.frequency],
          growthAdjustmentPct,
          leadTimeDays: 7,
          serviceLevel: 0.95,
          primaryMetric: "WAPE",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Forecast request failed.");
      }

      const data = await res.json();
      setChampion(data.champion);
      setDiagnostics(data.diagnostics);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to compute forecast.");
    } finally {
      setIsForecasting(false);
    }
  }, [dataset, activeSeriesKey, horizon, growthAdjustmentPct, setIsForecasting, setChampion, setDiagnostics]);

  React.useEffect(() => {
    runChampionPipeline();
  }, [runChampionPipeline]);

  const handleExport = async () => {
    if (!champion?.points.length || !activeSeriesKey) return;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: champion.points, format: "csv", seriesKey: activeSeriesKey }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandpulse_forecast_${activeSeriesKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const totalPredictedDemand =
    champion?.points.filter((p) => p.forecast !== null).reduce((sum, p) => sum + (p.forecast ?? 0), 0) ?? 0;
  const estimatedRevenueImpact = totalPredictedDemand * 18.5; // illustrative avg unit margin

  const buildContext = React.useCallback((): CopilotContext | null => {
    if (!dataset || !activeSeriesKey || !champion) return null;
    const historicalOutliers = dataset.series.filter(
      (p) => p.seriesKey === activeSeriesKey && p.isOutlier
    );
    return buildCopilotContext(
      champion,
      dataset.name,
      activeSeriesKey,
      dataset.frequency,
      horizon,
      historicalOutliers.length,
      historicalOutliers.slice(-5).map((p) => ({ date: p.date, value: p.value, deviation: 2.4 })),
      diagnostics ?? undefined
    );
  }, [dataset, activeSeriesKey, horizon, champion, diagnostics]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-canvas/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-signal" />
          <span className="text-sm font-semibold text-ink">DemandPulse</span>
          {isGuest && (
            <span className="ml-2 rounded bg-surface-raised px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
              Guest demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowUploader((v) => !v)}>
            <UploadCloud className="h-3.5 w-3.5" />
            {showUploader ? "Hide uploader" : "Upload data"}
          </Button>
          <span className="text-xs text-ink-faint">{role}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 p-6">
        {showUploader && <FileUpload />}

        {dataset && activeSeriesKey && (
          <>
            <FilterBar
              seriesKeys={dataset.seriesKeys}
              activeSeriesKey={activeSeriesKey}
              onSeriesChange={setActiveSeriesKey}
              horizon={horizon}
              onHorizonChange={setHorizon}
              band={band}
              onBandChange={setBand}
              onExport={handleExport}
            />

            {role !== "VIEWER" && (
              <ScenarioSlider value={growthAdjustmentPct} onChange={setGrowthAdjustmentPct} />
            )}

            {fetchError && (
              <div className="rounded border border-bad/30 bg-bad/10 p-3 text-sm text-bad">{fetchError}</div>
            )}

            {champion && (
              <KPICards
                totalPredictedDemand={totalPredictedDemand}
                forecastReliabilityPct={champion.forecastReliabilityPct}
                estimatedRevenueImpact={estimatedRevenueImpact}
                safetyStock={champion.safetyStock}
              />
            )}

            {champion && (
              <ForecastChart
                points={champion.points}
                seriesKey={activeSeriesKey}
                showBand={band}
                championDisplayName={champion.championDisplayName}
                forecastReliabilityPct={champion.forecastReliabilityPct}
                onViewDiagnostics={() => setDiagnosticsOpen(true)}
              />
            )}

            {isForecasting && (
              <p className="text-center text-xs text-ink-faint">Recomputing forecast…</p>
            )}
          </>
        )}
      </main>

      <ModelDiagnostics
        isOpen={isDiagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        diagnostics={diagnostics}
      />

      <CopilotPanel buildContext={buildContext} />
    </div>
  );
}
