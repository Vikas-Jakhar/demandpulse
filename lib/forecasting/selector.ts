/**
 * Champion Model Selector
 * ─────────────────────────────────────────────────────────────────────────
 * This is the one place "which model wins" gets decided. The main
 * dashboard imports only `selectChampion(...).champion` (a `ChampionPayload`
 * with a single forecast line); the diagnostics drawer is the only consumer
 * of the full `DiagnosticsPayload`, including the losing candidates'
 * benchmark rows. Keeping that split at the data layer — not just hidden in
 * the UI — is what makes "the main view never shows competing models" an
 * actual guarantee rather than a styling choice.
 */

import type {
  BenchmarkResult,
  CandidateModelId,
  ChampionPayload,
  Decomposition,
  DiagnosticsPayload,
  ForecastPoint,
  SafetyStockInput,
  SafetyStockResult,
  SelectionCriteria,
} from "@/types";
import { CANDIDATE_MODEL_REGISTRY } from "@/types";
import { runBacktest, rankBenchmarks } from "./backtest";
import { forecastHoltWinters } from "./holt-winters";
import {
  fitLinearTrendInSample,
  fitSeasonalMovingAverageInSample,
  runLinearTrendCandidate,
  runSeasonalMovingAverageCandidate,
} from "./candidates";
import { computeErrorMetrics } from "./metrics";
import { calculateSafetyStock, seriesStats } from "./safety-stock";

const Z80 = 1.2816;
const Z95 = 1.96;

export interface SelectChampionInput {
  dates: string[];
  values: number[];
  seasonalPeriods: number;
  productionHorizon: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  growthAdjustmentPct?: number;
  criteria?: SelectionCriteria;
  leadTimeDays?: number;
  serviceLevel?: number;
}

function residualStdDev(residuals: number[]): number {
  const n = residuals.length;
  if (n === 0) return 0;
  const mean = residuals.reduce((a, b) => a + b, 0) / n;
  const variance = residuals.reduce((acc, r) => acc + (r - mean) ** 2, 0) / Math.max(1, n - 1);
  return Math.sqrt(variance);
}

function stepMsFor(frequency: SelectChampionInput["frequency"]): number {
  const DAY = 24 * 60 * 60 * 1000;
  if (frequency === "WEEKLY") return DAY * 7;
  if (frequency === "MONTHLY") return DAY * 30;
  return DAY;
}

/**
 * Refits the champion model on the FULL series (train + holdout combined)
 * and produces the production forecast the dashboard will actually render.
 * The backtest only ever used a train slice — this is the step that makes
 * sure the number a planner sees is fit on all the history available, not
 * just the portion held back for scoring.
 */
function refitChampionOnFullData(
  championId: CandidateModelId,
  dates: string[],
  values: number[],
  horizon: number,
  seasonalPeriods: number,
  frequency: SelectChampionInput["frequency"],
  growthAdjustmentPct: number
): { points: ForecastPoint[]; decomposition: Decomposition[]; metrics: import("@/types").ErrorMetrics } {
  if (championId === "HOLT_WINTERS_ADDITIVE" || championId === "HOLT_WINTERS_MULTIPLICATIVE") {
    const mode = championId === "HOLT_WINTERS_ADDITIVE" ? "ADDITIVE" : "MULTIPLICATIVE";
    const { fit, points, decomposition } = forecastHoltWinters(
      dates,
      values,
      {
        seriesKey: "champion",
        horizon,
        horizonUnit: "DAYS",
        frequency,
        seasonalPeriods,
        seasonalityMode: mode,
        confidenceLevels: [0.8, 0.95],
      },
      growthAdjustmentPct
    );
    const metrics = computeErrorMetrics(values, fit.fitted);
    return { points, decomposition, metrics };
  }

  // Non-Holt-Winters champions: build fitted in-sample values, derive
  // residual sigma, then project the horizon with the same widening-band
  // convention used everywhere else in the app.
  const fitted =
    championId === "SEASONAL_MOVING_AVERAGE"
      ? fitSeasonalMovingAverageInSample(values, seasonalPeriods)
      : fitLinearTrendInSample(values);

  const residuals = values.map((v, i) => v - fitted[i]);
  const sigma = residualStdDev(residuals);
  const metrics = computeErrorMetrics(values, fitted);

  const horizonValues =
    championId === "SEASONAL_MOVING_AVERAGE"
      ? runSeasonalMovingAverageCandidate(values, horizon, seasonalPeriods)
      : runLinearTrendCandidate(values, horizon);

  const growthFactor = 1 + growthAdjustmentPct / 100;
  const stepMs = stepMsFor(frequency);
  const lastDate = new Date(dates[dates.length - 1]);

  const points: ForecastPoint[] = dates.map((date, i) => ({
    date,
    actual: values[i],
    fitted: fitted[i],
    forecast: null,
    lower80: null,
    upper80: null,
    lower95: null,
    upper95: null,
  }));

  horizonValues.forEach((rawValue, idx) => {
    const h = idx + 1;
    const yhat = Math.max(0, rawValue * growthFactor);
    const widthFactor = Math.sqrt(h);
    const futureDate = new Date(lastDate.getTime() + h * stepMs);
    points.push({
      date: futureDate.toISOString().slice(0, 10),
      actual: null,
      fitted: null,
      forecast: yhat,
      lower80: Math.max(0, yhat - Z80 * sigma * widthFactor),
      upper80: yhat + Z80 * sigma * widthFactor,
      lower95: Math.max(0, yhat - Z95 * sigma * widthFactor),
      upper95: yhat + Z95 * sigma * widthFactor,
    });
  });

  const decomposition: Decomposition[] = dates.map((date, i) => ({
    date,
    trend: fitted[i] ?? null,
    seasonal: null,
    residual: residuals[i] ?? null,
  }));

  return { points, decomposition, metrics };
}

/**
 * Runs the full Champion Model pipeline: backtest every candidate, rank by
 * the chosen primary metric (WAPE by default), refit the winner on the full
 * series, and return both the clean dashboard payload and the full
 * diagnostics bundle as separate objects.
 */
export function selectChampion(input: SelectChampionInput): {
  champion: ChampionPayload;
  diagnostics: DiagnosticsPayload;
} {
  const criteria: SelectionCriteria = input.criteria ?? { primaryMetric: "WAPE" };
  const growthAdjustmentPct = input.growthAdjustmentPct ?? 0;

  const backtest = runBacktest({
    dates: input.dates,
    values: input.values,
    seasonalPeriods: input.seasonalPeriods,
  });

  const ranked = rankBenchmarks(backtest.benchmarks, criteria.primaryMetric);
  const championBenchmark = ranked[0];

  const benchmarksWithFlag: BenchmarkResult[] = backtest.benchmarks.map((b) => ({
    ...b,
    isChampion: b.modelId === championBenchmark.modelId,
  }));

  const { points, decomposition, metrics } = refitChampionOnFullData(
    championBenchmark.modelId,
    input.dates,
    input.values,
    input.productionHorizon,
    input.seasonalPeriods,
    input.frequency,
    growthAdjustmentPct
  );

  const { mean, stdDev } = seriesStats(input.values);
  const safetyStockInput: SafetyStockInput = {
    avgDailyDemand: mean,
    demandStdDev: stdDev,
    leadTimeDays: input.leadTimeDays ?? 7,
    serviceLevel: input.serviceLevel ?? 0.95,
  };
  const safetyStock: SafetyStockResult = calculateSafetyStock(safetyStockInput);

  // Business-facing framing: "Forecast Reliability" is (1 - WAPE) off the
  // *backtest* (out-of-sample) score, not the in-sample fit — the honest
  // number for "how much should a planner trust this."
  const forecastReliabilityPct = Math.round(Math.max(0, 100 - championBenchmark.metrics.wape) * 10) / 10;

  const champion: ChampionPayload = {
    championModelId: championBenchmark.modelId,
    championDisplayName: CANDIDATE_MODEL_REGISTRY[championBenchmark.modelId].displayName,
    forecastReliabilityPct,
    points,
    decomposition,
    metrics,
    safetyStock,
    selectionCriteria: criteria,
  };

  const diagnostics: DiagnosticsPayload = {
    champion,
    benchmarks: rankBenchmarks(benchmarksWithFlag, criteria.primaryMetric),
    holdoutWindow: backtest.holdoutWindow,
  };

  return { champion, diagnostics };
}
