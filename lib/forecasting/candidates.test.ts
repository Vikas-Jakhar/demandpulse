import { describe, it, expect } from "vitest";
import {
  runNaiveCandidate,
  runSeasonalMovingAverageCandidate,
  runLinearTrendCandidate,
  fitLinearTrendInSample,
  fitNaiveInSample,
} from "@/lib/forecasting/candidates";

describe("runNaiveCandidate", () => {
  it("repeats the exact values from one seasonal cycle back on a perfectly periodic series", () => {
    // Three full cycles of period 3: [1,2,3, 1,2,3, 1,2,3]
    const values = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    const forecast = runNaiveCandidate(values, 3, 3);
    expect(forecast).toEqual([1, 2, 3]);
  });

  it("falls back to the last observed value when there's no prior cycle at all", () => {
    const values = [42]; // single point, no full cycle behind it
    const forecast = runNaiveCandidate(values, 2, 7);
    expect(forecast).toEqual([42, 42]);
  });

  it("never forecasts a negative value even if history dips below zero due to cleaning artifacts", () => {
    const values = [-5, -5, -5];
    const forecast = runNaiveCandidate(values, 1, 3);
    expect(forecast[0]).toBeGreaterThanOrEqual(0);
  });
});

describe("fitNaiveInSample", () => {
  it("predicts each point from exactly one seasonal cycle earlier", () => {
    const values = [1, 2, 3, 1, 2, 3];
    const fitted = fitNaiveInSample(values, 3);
    // First cycle (indices 0-2) has no prior cycle, so it falls back to a
    // running mean; the second cycle (indices 3-5) should exactly match
    // the first cycle's values.
    expect(fitted[3]).toBe(1);
    expect(fitted[4]).toBe(2);
    expect(fitted[5]).toBe(3);
  });
});

describe("runSeasonalMovingAverageCandidate", () => {
  it("converges to the constant value on a flat series", () => {
    const values = Array(20).fill(50);
    const forecast = runSeasonalMovingAverageCandidate(values, 3, 7);
    forecast.forEach((v) => expect(v).toBeCloseTo(50, 6));
  });

  it("weights recent cycles more heavily than older ones", () => {
    // Two cycles of period 4: an older low cycle, then a newer high cycle.
    // The forecast for that season-position should sit closer to the newer
    // value than a simple unweighted average would.
    const values = [10, 10, 10, 10, 30, 30, 30, 30];
    const forecast = runSeasonalMovingAverageCandidate(values, 1, 4, 2);
    const unweightedAverage = (10 + 30) / 2; // 20
    expect(forecast[0]).toBeGreaterThan(unweightedAverage);
  });
});

describe("runLinearTrendCandidate / fitLinearTrendInSample", () => {
  it("extrapolates a perfect linear trend exactly", () => {
    // y = 1 + 1*x for x = 0..4 → values 1,2,3,4,5
    const values = [1, 2, 3, 4, 5];
    const forecast = runLinearTrendCandidate(values, 2);
    expect(forecast[0]).toBeCloseTo(6, 6);
    expect(forecast[1]).toBeCloseTo(7, 6);
  });

  it("fits the same line in-sample as it extrapolates out-of-sample", () => {
    const values = [2, 4, 6, 8, 10]; // y = 2 + 2x
    const fitted = fitLinearTrendInSample(values);
    fitted.forEach((v, i) => expect(v).toBeCloseTo(values[i], 6));
  });

  it("never fits a negative value even with a steep downward trend", () => {
    const values = [100, 50, 10, 2];
    const fitted = fitLinearTrendInSample(values);
    fitted.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
  });
});
