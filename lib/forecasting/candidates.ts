/**
 * Champion Model Selection — Candidate Runners
 * ─────────────────────────────────────────────────────────────────────────
 * Each function here fits a model on `trainValues` only and produces a
 * point forecast for the next `horizon` periods, with no knowledge of the
 * holdout actuals. `backtest.ts` scores these against the real holdout
 * values; `selector.ts` picks the winner and refits it on the full series
 * for the production forecast the dashboard actually renders.
 *
 * Keeping each candidate to a plain (dates in, values out) function makes
 * it trivial to add a real external call later — LINEAR_TREND_BASELINE is
 * deliberately the slot where `lib/forecasting/external-model.ts` would
 * plug in a Prophet/Auto-ARIMA/XGBoost microservice without touching the
 * selector's ranking logic.
 */

import type { CandidateModelId } from "@/types";
import { runHoltWinters, fitHoltWinters } from "./holt-winters";

export interface CandidateForecast {
  modelId: CandidateModelId;
  values: number[]; // length === horizon
}

/** Holt-Winters, either seasonality mode, fit on the training slice only. */
export function runHoltWintersCandidate(
  trainValues: number[],
  horizon: number,
  seasonalPeriods: number,
  mode: "ADDITIVE" | "MULTIPLICATIVE"
): number[] {
  const m = Math.max(2, seasonalPeriods);
  const fit = fitHoltWinters(trainValues, m, mode);
  const lastLevel = fit.level[fit.level.length - 1];
  const lastTrend = fit.trend[fit.trend.length - 1];

  const forecasts: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const seasonIdx = (trainValues.length + h - 1) % m;
    const s = fit.seasonal[seasonIdx] ?? (mode === "ADDITIVE" ? 0 : 1);
    const raw = mode === "ADDITIVE" ? lastLevel + h * lastTrend + s : (lastLevel + h * lastTrend) * s;
    forecasts.push(Math.max(0, raw));
  }
  return forecasts;
}

/**
 * Seasonal Naive: forecasts each future point as whatever was observed at
 * the same seasonal position one cycle back (falls back to the very last
 * observed value if there's no prior cycle yet). This is deliberately the
 * simplest candidate in the lineup — no fitting, no parameters — and it
 * exists precisely because "the fancy model loses to doing nothing clever"
 * is a real, useful outcome for a backtest to surface on a flat or heavily
 * noise-dominated series. If Naive wins, that's the pipeline correctly
 * telling you the data doesn't support anything more sophisticated yet.
 */
export function runNaiveCandidate(trainValues: number[], horizon: number, seasonalPeriods: number): number[] {
  const m = Math.max(2, seasonalPeriods);
  const lastValue = trainValues[trainValues.length - 1] ?? 0;

  const forecasts: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const seasonsBack = Math.ceil(h / m) * m;
    const idx = trainValues.length - seasonsBack + ((h - 1) % m);
    forecasts.push(Math.max(0, idx >= 0 ? trainValues[idx] : lastValue));
  }
  return forecasts;
}

/**
 * Seasonal Weighted Moving Average: averages the same season-index position
 * across the most recent `cycles` seasonal cycles, weighting more recent
 * cycles more heavily. A deliberately simple, highly explainable baseline —
 * useful exactly because it sometimes beats a fancier model on short or
 * noisy series, which is the whole point of backtesting rather than
 * assuming the most sophisticated candidate always wins.
 */
export function runSeasonalMovingAverageCandidate(
  trainValues: number[],
  horizon: number,
  seasonalPeriods: number,
  cycles = 4
): number[] {
  const m = Math.max(2, seasonalPeriods);
  const n = trainValues.length;
  const forecasts: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    // Absolute index of the point being forecast, projected from the start
    // of the training array. Walking back c*m from it lands on the same
    // season position c cycles earlier — no separate seasonIdx/modulo
    // wraparound needed, which is what the previous version got wrong: it
    // computed idx via seasonIdx plus an extra unconditional "- m" offset,
    // which shifted every sample one cycle further into the past than
    // intended and inverted which cycle got the higher weight (c=1 landed
    // on the *second*-most-recent cycle instead of the most recent one).
    const target = n + h - 1;
    const samples: { value: number; weight: number }[] = [];

    for (let c = 1; c <= cycles; c++) {
      const idx = target - c * m;
      if (idx >= 0 && idx < n) {
        samples.push({ value: trainValues[idx], weight: cycles - c + 1 });
      }
    }

    if (samples.length === 0) {
      const fallbackAvg = trainValues.reduce((a, b) => a + b, 0) / (n || 1);
      forecasts.push(fallbackAvg);
      continue;
    }

    const weightSum = samples.reduce((acc, s) => acc + s.weight, 0);
    const weighted = samples.reduce((acc, s) => acc + s.value * s.weight, 0) / weightSum;
    forecasts.push(Math.max(0, weighted));
  }

  return forecasts;
}

/**
 * Linear trend baseline: ordinary least-squares fit over the training
 * window, projected forward with no seasonal adjustment. This is the
 * simplest possible candidate and the natural slot to later replace with a
 * real Prophet/Auto-ARIMA microservice call (see external-model.ts) — the
 * selector doesn't care how a candidate's numbers were produced, only how
 * they score against the holdout.
 */
export function runLinearTrendCandidate(trainValues: number[], horizon: number): number[] {
  const n = trainValues.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = trainValues.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (trainValues[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  const forecasts: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    forecasts.push(Math.max(0, intercept + slope * (n - 1 + h)));
  }
  return forecasts;
}

/**
 * Causal in-sample fitted values for Seasonal Naive — at each point, uses
 * whatever was observed one seasonal cycle earlier (falls back to a running
 * mean before the first full cycle exists, same convention as the other
 * candidates' in-sample fits).
 */
export function fitNaiveInSample(values: number[], seasonalPeriods: number): number[] {
  const m = Math.max(2, seasonalPeriods);
  const fitted: number[] = [];
  for (let t = 0; t < values.length; t++) {
    const idx = t - m;
    if (idx >= 0) {
      fitted.push(values[idx]);
    } else {
      const seen = values.slice(0, t);
      fitted.push(seen.length ? seen.reduce((a, b) => a + b, 0) / seen.length : values[0] ?? 0);
    }
  }
  return fitted;
}

/**
 * Causal in-sample fitted values for the seasonal moving average — at each
 * point, only uses data strictly before it, the same way the model would
 * behave in production. Needed so a Seasonal MA champion can still report
 * residual-based confidence bands, the same as the other candidates.
 */
export function fitSeasonalMovingAverageInSample(
  values: number[],
  seasonalPeriods: number,
  cycles = 4
): number[] {
  const m = Math.max(2, seasonalPeriods);
  const fitted: number[] = [];
  const runningMean = () => {
    const seen = fitted.length > 0 ? values.slice(0, fitted.length) : [];
    return seen.length ? seen.reduce((a, b) => a + b, 0) / seen.length : values[0] ?? 0;
  };

  for (let t = 0; t < values.length; t++) {
    const samples: { value: number; weight: number }[] = [];
    for (let c = 1; c <= cycles; c++) {
      const idx = t - c * m;
      if (idx >= 0) samples.push({ value: values[idx], weight: cycles - c + 1 });
    }
    if (samples.length === 0) {
      fitted.push(runningMean());
      continue;
    }
    const weightSum = samples.reduce((acc, s) => acc + s.weight, 0);
    fitted.push(samples.reduce((acc, s) => acc + s.value * s.weight, 0) / weightSum);
  }
  return fitted;
}

/** In-sample fitted values for the linear trend baseline (simple OLS line). */
export function fitLinearTrendInSample(values: number[]): number[] {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (values[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return xs.map((x) => Math.max(0, intercept + slope * x));
}

/** Runs every registered candidate against the same training slice and horizon. */
export function runAllCandidates(
  trainValues: number[],
  horizon: number,
  seasonalPeriods: number
): CandidateForecast[] {
  return [
    {
      modelId: "NAIVE",
      values: runNaiveCandidate(trainValues, horizon, seasonalPeriods),
    },
    {
      modelId: "HOLT_WINTERS_ADDITIVE",
      values: runHoltWintersCandidate(trainValues, horizon, seasonalPeriods, "ADDITIVE"),
    },
    {
      modelId: "HOLT_WINTERS_MULTIPLICATIVE",
      values: runHoltWintersCandidate(trainValues, horizon, seasonalPeriods, "MULTIPLICATIVE"),
    },
    {
      modelId: "MOVING_AVERAGE",
      values: runSeasonalMovingAverageCandidate(trainValues, horizon, seasonalPeriods),
    },
    {
      modelId: "LINEAR_TREND_BASELINE",
      values: runLinearTrendCandidate(trainValues, horizon),
    },
  ];
}
