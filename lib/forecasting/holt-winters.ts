/**
 * DemandPulse Forecasting Engine — Holt-Winters Triple Exponential Smoothing
 * ─────────────────────────────────────────────────────────────────────────
 * A from-scratch, dependency-free implementation. No black-box calls to an
 * external stats library: every coefficient below is auditable, which
 * matters for a supply-chain forecast a business will hold inventory against.
 *
 * Supports both additive and multiplicative seasonality, automatic parameter
 * fitting via grid-search minimizing SSE, residual-based confidence
 * intervals (assumes approximately normal residuals, which is standard
 * practice for this class of model), and a Prophet/XGBoost-compatible
 * request/response contract so an external ML microservice can be dropped
 * in behind the same interface (see `lib/forecasting/external-model.ts`).
 */

import type {
  HoltWintersParams,
  ForecastPoint,
  ForecastRequest,
  Decomposition,
} from "@/types";
import { computeErrorMetrics } from "./metrics";

export interface FitResult {
  params: HoltWintersParams;
  level: number[];
  trend: number[];
  seasonal: number[]; // length = seasonalPeriods, last estimated cycle
  fitted: number[];
  residuals: number[];
  sse: number;
}

const Z_SCORES: Record<string, number> = {
  "0.8": 1.2816,
  "0.9": 1.6449,
  "0.95": 1.9600,
  "0.99": 2.5758,
};

function zFor(confidence: number): number {
  const key = confidence.toFixed(2).replace(/0$/, "");
  return Z_SCORES[confidence.toString()] ?? Z_SCORES[key] ?? 1.96;
}

/** Initializes level, trend, and seasonal indices from the first 2 full seasonal cycles. */
function initializeComponents(
  values: number[],
  m: number,
  mode: "ADDITIVE" | "MULTIPLICATIVE"
): { level0: number; trend0: number; seasonal0: number[] } {
  if (values.length < 2 * m) {
    // Not enough data for 2 full cycles — fall back to a single-cycle,
    // trend-free initialization rather than throwing, so short series still work.
    const avg = values.slice(0, m).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(m, values.length));
    const seasonal0 = Array.from({ length: m }, (_, i) =>
      mode === "ADDITIVE" ? (values[i] ?? avg) - avg : (values[i] ?? avg) / (avg || 1)
    );
    return { level0: avg, trend0: 0, seasonal0 };
  }

  const cycle1Avg = values.slice(0, m).reduce((a, b) => a + b, 0) / m;
  const cycle2Avg = values.slice(m, 2 * m).reduce((a, b) => a + b, 0) / m;
  const trend0 = (cycle2Avg - cycle1Avg) / m;

  const seasonal0: number[] = [];
  for (let i = 0; i < m; i++) {
    const v1 = values[i];
    const v2 = values[m + i];
    if (mode === "ADDITIVE") {
      seasonal0.push((v1 - cycle1Avg + (v2 - cycle2Avg)) / 2);
    } else {
      const c1 = cycle1Avg || 1e-6;
      const c2 = cycle2Avg || 1e-6;
      seasonal0.push((v1 / c1 + v2 / c2) / 2);
    }
  }

  return { level0: cycle1Avg, trend0, seasonal0 };
}

/**
 * Runs one full pass of triple exponential smoothing for a fixed (alpha, beta, gamma)
 * and returns fitted values + SSE. Used both for grid-search fitting and for the
 * final production run once optimal parameters are chosen.
 */
export function runHoltWinters(
  values: number[],
  m: number,
  mode: "ADDITIVE" | "MULTIPLICATIVE",
  params: HoltWintersParams
): FitResult {
  const { alpha, beta, gamma } = params;
  const n = values.length;
  const { level0, trend0, seasonal0 } = initializeComponents(values, m, mode);

  const level: number[] = [level0];
  const trend: number[] = [trend0];
  const seasonal: number[] = [...seasonal0]; // circular buffer indexed by t % m
  const fitted: number[] = [];
  const residuals: number[] = [];

  for (let t = 0; t < n; t++) {
    const seasonIdx = t % m;
    const sPrev = seasonal[seasonIdx] ?? (mode === "ADDITIVE" ? 0 : 1);
    const lPrev = level[level.length - 1];
    const bPrev = trend[trend.length - 1];

    const yhat = mode === "ADDITIVE" ? lPrev + bPrev + sPrev : (lPrev + bPrev) * sPrev;
    fitted.push(yhat);

    const y = values[t];
    residuals.push(y - yhat);

    let lNew: number;
    let bNew: number;
    let sNew: number;

    if (mode === "ADDITIVE") {
      lNew = alpha * (y - sPrev) + (1 - alpha) * (lPrev + bPrev);
      bNew = beta * (lNew - lPrev) + (1 - beta) * bPrev;
      sNew = gamma * (y - lNew) + (1 - gamma) * sPrev;
    } else {
      const safeS = sPrev || 1e-6;
      lNew = alpha * (y / safeS) + (1 - alpha) * (lPrev + bPrev);
      bNew = beta * (lNew - lPrev) + (1 - beta) * bPrev;
      const safeL = lNew || 1e-6;
      sNew = gamma * (y / safeL) + (1 - gamma) * sPrev;
    }

    level.push(lNew);
    trend.push(bNew);
    seasonal[seasonIdx] = sNew;
  }

  const sse = residuals.reduce((acc, r) => acc + r * r, 0);

  return { params, level, trend, seasonal, fitted, residuals, sse };
}

/**
 * Grid-search fit: sweeps alpha/beta/gamma on a coarse-to-fine grid and
 * returns the combination minimizing SSE. This avoids pulling in a general
 * nonlinear optimizer dependency for what is, in practice, a well-behaved
 * 3-parameter surface over [0,1]^3.
 */
export function fitHoltWinters(
  values: number[],
  m: number,
  mode: "ADDITIVE" | "MULTIPLICATIVE"
): FitResult {
  const coarseSteps = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95];
  let best: FitResult | null = null;

  for (const alpha of coarseSteps) {
    for (const beta of coarseSteps) {
      for (const gamma of coarseSteps) {
        const result = runHoltWinters(values, m, mode, { alpha, beta, gamma });
        if (!best || result.sse < best.sse) best = result;
      }
    }
  }

  // Refine around the coarse optimum with a finer local grid.
  const base = best!.params;
  const fineDelta = 0.04;
  const fineSteps = (center: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const v = center + (i - 2) * fineDelta;
      return Math.min(0.98, Math.max(0.01, v));
    });

  for (const alpha of fineSteps(base.alpha)) {
    for (const beta of fineSteps(base.beta)) {
      for (const gamma of fineSteps(base.gamma)) {
        const result = runHoltWinters(values, m, mode, { alpha, beta, gamma });
        if (result.sse < best!.sse) best = result;
      }
    }
  }

  return best!;
}

/** Standard deviation of residuals, used for confidence-interval width. */
function residualStdDev(residuals: number[]): number {
  const n = residuals.length;
  if (n === 0) return 0;
  const mean = residuals.reduce((a, b) => a + b, 0) / n;
  const variance = residuals.reduce((acc, r) => acc + (r - mean) ** 2, 0) / Math.max(1, n - 1);
  return Math.sqrt(variance);
}

/**
 * Produces the full forecast: historical fitted line + an out-of-sample
 * horizon with widening confidence bands (uncertainty grows with sqrt(h),
 * the standard multi-step-ahead approximation for exponential smoothing).
 */
export function forecastHoltWinters(
  dates: string[],
  values: number[],
  request: ForecastRequest,
  growthAdjustmentPct = 0
): {
  fit: FitResult;
  points: ForecastPoint[];
  decomposition: Decomposition[];
} {
  const m = Math.max(2, request.seasonalPeriods);
  const mode = request.seasonalityMode;
  const fit = fitHoltWinters(values, m, mode);
  const sigma = residualStdDev(fit.residuals);

  const points: ForecastPoint[] = dates.map((date, i) => ({
    date,
    actual: values[i],
    fitted: fit.fitted[i],
    forecast: null,
    lower80: null,
    upper80: null,
    lower95: null,
    upper95: null,
  }));

  // Project the horizon forward from the final level/trend/seasonal state.
  const lastLevel = fit.level[fit.level.length - 1];
  const lastTrend = fit.trend[fit.trend.length - 1];
  const lastDate = new Date(dates[dates.length - 1]);
  const stepMs = inferStepMs(request.frequency);
  const growthFactor = 1 + growthAdjustmentPct / 100;

  for (let h = 1; h <= request.horizon; h++) {
    const seasonIdx = (values.length + h - 1) % m;
    const s = fit.seasonal[seasonIdx] ?? (mode === "ADDITIVE" ? 0 : 1);
    const rawForecast =
      mode === "ADDITIVE" ? lastLevel + h * lastTrend + s : (lastLevel + h * lastTrend) * s;
    const yhat = Math.max(0, rawForecast * growthFactor);

    // Multi-step-ahead uncertainty grows roughly with sqrt(h) for smoothing models.
    const widthFactor = Math.sqrt(h);
    const z80 = zFor(0.8);
    const z95 = zFor(0.95);

    const futureDate = new Date(lastDate.getTime() + h * stepMs);

    points.push({
      date: futureDate.toISOString().slice(0, 10),
      actual: null,
      fitted: null,
      forecast: yhat,
      lower80: Math.max(0, yhat - z80 * sigma * widthFactor),
      upper80: yhat + z80 * sigma * widthFactor,
      lower95: Math.max(0, yhat - z95 * sigma * widthFactor),
      upper95: yhat + z95 * sigma * widthFactor,
    });
  }

  const decomposition: Decomposition[] = dates.map((date, i) => {
    const seasonIdx = i % m;
    const s = fit.seasonal[seasonIdx] ?? (mode === "ADDITIVE" ? 0 : 1);
    return {
      date,
      trend: fit.level[i] ?? null,
      seasonal: s,
      residual: fit.residuals[i] ?? null,
    };
  });

  return { fit, points, decomposition };
}

function inferStepMs(frequency: ForecastRequest["frequency"]): number {
  const DAY = 24 * 60 * 60 * 1000;
  switch (frequency) {
    case "DAILY":
      return DAY;
    case "WEEKLY":
      return DAY * 7;
    case "MONTHLY":
      return DAY * 30; // approximation; calendar-exact months are handled at the resample layer
    default:
      return DAY;
  }
}

/** Convenience wrapper: fit + forecast + metrics in one call for the API route. */
export function runForecastPipeline(
  dates: string[],
  values: number[],
  request: ForecastRequest,
  growthAdjustmentPct = 0
) {
  const { fit, points, decomposition } = forecastHoltWinters(
    dates,
    values,
    request,
    growthAdjustmentPct
  );
  const metrics = computeErrorMetrics(values, fit.fitted);
  return { fit, points, decomposition, metrics };
}
