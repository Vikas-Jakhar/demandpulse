import type { ErrorMetrics } from "@/types";

/**
 * Computes the standard forecast-accuracy metric suite over the in-sample
 * fitted values. All functions guard against division-by-zero on true zeros
 * in the actuals (common in intermittent-demand SKUs) by excluding those
 * points from the percentage-based metrics rather than producing Infinity.
 */
export function computeErrorMetrics(actuals: number[], fitted: number[]): ErrorMetrics {
  const n = Math.min(actuals.length, fitted.length);
  if (n === 0) {
    return { mape: 0, rmse: 0, mae: 0, wape: 0, bias: 0, trackingSignal: 0 };
  }

  let absErrorSum = 0;
  let sqErrorSum = 0;
  let signedErrorSum = 0;
  let actualsSum = 0;
  let percentErrorSum = 0;
  let percentErrorCount = 0;

  for (let i = 0; i < n; i++) {
    const a = actuals[i];
    const f = fitted[i];
    const error = a - f;

    absErrorSum += Math.abs(error);
    sqErrorSum += error * error;
    signedErrorSum += error;
    actualsSum += Math.abs(a);

    if (a !== 0) {
      percentErrorSum += Math.abs(error / a);
      percentErrorCount += 1;
    }
  }

  const mae = absErrorSum / n;
  const rmse = Math.sqrt(sqErrorSum / n);
  const mape = percentErrorCount > 0 ? (percentErrorSum / percentErrorCount) * 100 : 0;
  const wape = actualsSum > 0 ? (absErrorSum / actualsSum) * 100 : 0;
  const bias = signedErrorSum / n; // + means the model over-forecasts on average (actual < fitted → negative; keep sign convention explicit below)

  // Tracking signal: running sum of forecast errors divided by MAD.
  // |TS| > 4 is the common industry threshold for "the model has drifted".
  const mad = mae || 1e-6;
  const trackingSignal = signedErrorSum / mad;

  return {
    mape: round2(mape),
    rmse: round2(rmse),
    mae: round2(mae),
    wape: round2(wape),
    bias: round2(bias),
    trackingSignal: round2(trackingSignal),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Human-readable interpretation used by the KPI cards and the AI copilot's grounding context. */
export function interpretTrackingSignal(ts: number): "Stable" | "Watch" | "Drifting" {
  const abs = Math.abs(ts);
  if (abs <= 2) return "Stable";
  if (abs <= 4) return "Watch";
  return "Drifting";
}
