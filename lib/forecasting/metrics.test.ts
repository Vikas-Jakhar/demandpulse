import { describe, it, expect } from "vitest";
import { computeErrorMetrics, interpretTrackingSignal } from "@/lib/forecasting/metrics";

describe("computeErrorMetrics", () => {
  it("computes MAE/RMSE/MAPE/WAPE/bias correctly against a hand-worked example", () => {
    // actual=100 throughout; fitted alternates ±10. Errors: -10, +10, 0.
    const actuals = [100, 100, 100];
    const fitted = [110, 90, 100];

    const metrics = computeErrorMetrics(actuals, fitted);

    // MAE = mean(|−10|,|10|,|0|) = 20/3 = 6.666… → 6.67
    expect(metrics.mae).toBeCloseTo(6.67, 2);
    // RMSE = sqrt(mean(100,100,0)) = sqrt(66.666…) = 8.1650…
    expect(metrics.rmse).toBeCloseTo(8.16, 1);
    // MAPE = mean(10%, 10%, 0%) = 6.666…% → 6.67
    expect(metrics.mape).toBeCloseTo(6.67, 2);
    // WAPE = sum|error| / sum|actual| = 20/300 = 6.666…% → 6.67
    expect(metrics.wape).toBeCloseTo(6.67, 2);
    // Bias = mean(-10, 10, 0) = 0 — errors cancel out
    expect(metrics.bias).toBeCloseTo(0, 6);
  });

  it("returns zeroed metrics for an empty series instead of NaN/Infinity", () => {
    const metrics = computeErrorMetrics([], []);
    expect(metrics).toEqual({ mape: 0, rmse: 0, mae: 0, wape: 0, bias: 0, trackingSignal: 0 });
  });

  it("excludes true-zero actuals from MAPE rather than producing Infinity", () => {
    // A zero actual with a nonzero forecast would blow up a naive percentage
    // error to Infinity; intermittent-demand SKUs make this a real case, not
    // an edge case to shrug off.
    const actuals = [0, 100];
    const fitted = [5, 100];
    const metrics = computeErrorMetrics(actuals, fitted);
    expect(Number.isFinite(metrics.mape)).toBe(true);
    // Only the second point (actual=100) contributes to MAPE: error 0% → MAPE 0.
    expect(metrics.mape).toBe(0);
  });

  it("detects a perfect fit as all-zero error metrics", () => {
    const series = [10, 20, 30, 40];
    const metrics = computeErrorMetrics(series, series);
    expect(metrics.mae).toBe(0);
    expect(metrics.rmse).toBe(0);
    expect(metrics.mape).toBe(0);
    expect(metrics.wape).toBe(0);
    expect(metrics.bias).toBe(0);
  });

  it("reports a positive tracking signal when the model persistently under-forecasts", () => {
    // actual consistently higher than fitted → model is under-forecasting →
    // signedErrorSum (actual - fitted) is positive throughout.
    const actuals = [100, 110, 120, 130];
    const fitted = [90, 95, 100, 105];
    const metrics = computeErrorMetrics(actuals, fitted);
    expect(metrics.bias).toBeGreaterThan(0);
    expect(metrics.trackingSignal).toBeGreaterThan(0);
  });
});

describe("interpretTrackingSignal", () => {
  it("classifies |TS| <= 2 as Stable", () => {
    expect(interpretTrackingSignal(1.5)).toBe("Stable");
    expect(interpretTrackingSignal(-2)).toBe("Stable");
  });

  it("classifies 2 < |TS| <= 4 as Watch", () => {
    expect(interpretTrackingSignal(3)).toBe("Watch");
    expect(interpretTrackingSignal(-4)).toBe("Watch");
  });

  it("classifies |TS| > 4 as Drifting", () => {
    expect(interpretTrackingSignal(4.5)).toBe("Drifting");
    expect(interpretTrackingSignal(-10)).toBe("Drifting");
  });
});
