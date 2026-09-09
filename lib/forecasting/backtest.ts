import type { BenchmarkResult, CandidateModelId } from "@/types";
import { CANDIDATE_MODEL_REGISTRY } from "@/types";
import { runAllCandidates } from "./candidates";
import { computeErrorMetrics } from "./metrics";

export interface BacktestInput {
  dates: string[];
  values: number[];
  seasonalPeriods: number;
  holdoutRatio?: number; // fraction of the series held out for validation, default 20%
  minHoldoutPeriods?: number;
}

export interface BacktestOutput {
  benchmarks: BenchmarkResult[];
  holdoutWindow: { start: string; end: string; periods: number };
  trainDates: string[];
  trainValues: number[];
}

/**
 * Splits the series into train/holdout, runs every candidate on the train
 * slice only, and scores each against the real holdout actuals. This is the
 * only place "ground truth vs. candidate" comparisons happen — the
 * dashboard never sees this, only `selector.ts`'s ranked output of it.
 */
export function runBacktest(input: BacktestInput): BacktestOutput {
  const { dates, values, seasonalPeriods } = input;
  const holdoutRatio = input.holdoutRatio ?? 0.2;
  const minHoldout = input.minHoldoutPeriods ?? Math.max(4, Math.min(seasonalPeriods, 14));

  const n = values.length;
  let holdoutSize = Math.max(minHoldout, Math.round(n * holdoutRatio));
  // Guard against a holdout that would leave too little training data to fit a seasonal model.
  holdoutSize = Math.min(holdoutSize, Math.floor(n / 3));
  holdoutSize = Math.max(1, holdoutSize);

  const trainDates = dates.slice(0, n - holdoutSize);
  const trainValues = values.slice(0, n - holdoutSize);
  const holdoutDates = dates.slice(n - holdoutSize);
  const holdoutValues = values.slice(n - holdoutSize);

  const candidateResults = runAllCandidates(trainValues, holdoutSize, seasonalPeriods);

  const benchmarks: BenchmarkResult[] = candidateResults.map((candidate) => {
    const start = performance.now();
    const metrics = computeErrorMetrics(holdoutValues, candidate.values);
    const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;

    return {
      modelId: candidate.modelId,
      displayName: CANDIDATE_MODEL_REGISTRY[candidate.modelId].displayName,
      metrics,
      executionTimeMs,
      isChampion: false, // selector.ts sets this on the winner
      holdoutPoints: holdoutDates.map((date, i) => ({
        date,
        actual: holdoutValues[i],
        predicted: candidate.values[i],
      })),
    };
  });

  return {
    benchmarks,
    holdoutWindow: {
      start: holdoutDates[0] ?? "",
      end: holdoutDates[holdoutDates.length - 1] ?? "",
      periods: holdoutSize,
    },
    trainDates,
    trainValues,
  };
}

/** Ranks benchmarks by the chosen primary metric, lowest (best) first. */
export function rankBenchmarks(
  benchmarks: BenchmarkResult[],
  primaryMetric: "WAPE" | "MAPE" | "RMSE" = "WAPE"
): BenchmarkResult[] {
  const key = primaryMetric.toLowerCase() as "wape" | "mape" | "rmse";
  return [...benchmarks].sort((a, b) => a.metrics[key] - b.metrics[key]);
}
