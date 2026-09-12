import { describe, it, expect } from "vitest";
import { fitHoltWinters, forecastHoltWinters, runHoltWinters } from "@/lib/forecasting/holt-winters";

/** Builds a perfectly periodic series with a given seasonal pattern and optional linear trend, no noise. */
function buildSeasonalSeries(pattern: number[], cycles: number, trendPerStep = 0): number[] {
  const values: number[] = [];
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i < pattern.length; i++) {
      values.push(pattern[i] + trendPerStep * (c * pattern.length + i));
    }
  }
  return values;
}

describe("fitHoltWinters", () => {
  it("learns a noise-free seasonal pattern well enough that later-cycle fitted values are close to the truth", () => {
    const pattern = [10, 20, 15, 25, 10, 5, 30];
    const values = buildSeasonalSeries(pattern, 6); // 6 full weekly cycles, no trend
    const fit = fitHoltWinters(values, 7, "ADDITIVE");

    // Smoothing needs a cycle or two to warm up; by the last cycle the
    // model should have essentially learned the pattern on noise-free data.
    // Tolerance is intentionally loose (absolute error < 3, against a
    // pattern with amplitude 5-30) rather than tuned to the tightest bound
    // that happens to pass — this proves real convergence without being
    // brittle to which exact alpha/beta/gamma the grid search lands on.
    const lastCycleStart = values.length - pattern.length;
    for (let i = lastCycleStart; i < values.length; i++) {
      expect(Math.abs(fit.fitted[i] - values[i])).toBeLessThan(3);
    }
  });

  it("produces a lower SSE for the grid-searched parameters than for an arbitrary bad guess", () => {
    const pattern = [10, 20, 15, 25, 10, 5, 30];
    const values = buildSeasonalSeries(pattern, 6, 0.5); // with mild trend
    const fit = fitHoltWinters(values, 7, "ADDITIVE");

    // The whole point of grid-search fitting is that it beats a naive
    // hand-picked parameter set — if it doesn't, the search is broken.
    const badFit = runHoltWinters(values, 7, "ADDITIVE", { alpha: 0.01, beta: 0.01, gamma: 0.01 });

    expect(fit.sse).toBeLessThan(badFit.sse);
  });
});

describe("forecastHoltWinters", () => {
  const pattern = [10, 20, 15, 25, 10, 5, 30];
  const values = buildSeasonalSeries(pattern, 6);
  const dates = values.map((_, i) => `2024-01-${String((i % 28) + 1).padStart(2, "0")}`);
  const baseRequest = {
    seriesKey: "TEST",
    horizonUnit: "DAYS" as const,
    frequency: "DAILY" as const,
    seasonalPeriods: 7,
    seasonalityMode: "ADDITIVE" as const,
    confidenceLevels: [0.8, 0.95],
  };

  it("widens the confidence interval as the horizon extends further out", () => {
    const { points } = forecastHoltWinters(dates, values, { ...baseRequest, horizon: 14 });
    const forecastPoints = points.filter((p) => p.forecast !== null);
    const firstWidth = forecastPoints[0].upper95! - forecastPoints[0].lower95!;
    const lastWidth =
      forecastPoints[forecastPoints.length - 1].upper95! - forecastPoints[forecastPoints.length - 1].lower95!;

    expect(lastWidth).toBeGreaterThan(firstWidth);
  });

  it("always nests the 80% band inside the 95% band", () => {
    const { points } = forecastHoltWinters(dates, values, { ...baseRequest, horizon: 7 });
    for (const p of points.filter((p) => p.forecast !== null)) {
      expect(p.lower95!).toBeLessThanOrEqual(p.lower80!);
      expect(p.upper95!).toBeGreaterThanOrEqual(p.upper80!);
    }
  });

  it("applies a scenario growth adjustment proportionally to the forecast", () => {
    const request = { ...baseRequest, horizon: 7 };
    const base = forecastHoltWinters(dates, values, request, 0);
    const boosted = forecastHoltWinters(dates, values, request, 20); // +20%

    const baseFirst = base.points.find((p) => p.forecast !== null)!.forecast!;
    const boostedFirst = boosted.points.find((p) => p.forecast !== null)!.forecast!;

    expect(boostedFirst).toBeCloseTo(baseFirst * 1.2, 4);
  });
});
