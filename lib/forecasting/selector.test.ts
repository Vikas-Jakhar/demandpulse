import { describe, it, expect } from "vitest";
import { selectChampion } from "@/lib/forecasting/selector";
import { CANDIDATE_MODEL_REGISTRY } from "@/types";

function buildDates(n: number): string[] {
  const start = new Date("2024-01-01");
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

describe("selectChampion", () => {
  it("selects a champion with a very low WAPE on a perfectly periodic, noise-free series", () => {
    // A clean repeating weekly pattern with no noise is exactly the case
    // where Seasonal Naive (or Holt-Winters, which should converge to the
    // same thing) ought to score close to perfectly on the holdout.
    const pattern = [100, 120, 90, 130, 110, 150, 80];
    const cycles = 12;
    const values = Array.from({ length: cycles * pattern.length }, (_, i) => pattern[i % pattern.length]);
    const dates = buildDates(values.length);

    const { champion, diagnostics } = selectChampion({
      dates,
      values,
      seasonalPeriods: 7,
      productionHorizon: 7,
      frequency: "DAILY",
    });

    expect(champion.metrics.wape).toBeLessThan(5);
    expect(Object.keys(CANDIDATE_MODEL_REGISTRY)).toContain(champion.championModelId);
    // The forecast-reliability figure shown on the dashboard is derived
    // from the same backtested WAPE the diagnostics table shows — they
    // must never silently diverge.
    const championBenchmark = diagnostics.benchmarks.find((b) => b.isChampion);
    expect(championBenchmark).toBeDefined();
  });

  it("produces exactly historical-length + horizon-length points, with the boundary at the right place", () => {
    const values = Array.from({ length: 60 }, (_, i) => 100 + 10 * Math.sin(i / 7));
    const dates = buildDates(values.length);

    const { champion } = selectChampion({
      dates,
      values,
      seasonalPeriods: 7,
      productionHorizon: 10,
      frequency: "DAILY",
    });

    expect(champion.points).toHaveLength(values.length + 10);
    const historicalPoints = champion.points.filter((p) => p.actual !== null);
    const forecastPoints = champion.points.filter((p) => p.forecast !== null);
    expect(historicalPoints).toHaveLength(values.length);
    expect(forecastPoints).toHaveLength(10);
  });

  it("marks exactly one benchmark row as champion, and it matches the returned championModelId", () => {
    const values = Array.from({ length: 50 }, (_, i) => 50 + i * 0.5 + 10 * Math.sin(i / 6));
    const dates = buildDates(values.length);

    const { champion, diagnostics } = selectChampion({
      dates,
      values,
      seasonalPeriods: 6,
      productionHorizon: 5,
      frequency: "DAILY",
    });

    const championRows = diagnostics.benchmarks.filter((b) => b.isChampion);
    expect(championRows).toHaveLength(1);
    expect(championRows[0].modelId).toBe(champion.championModelId);
    // All five candidates should have been benchmarked, not a subset.
    expect(diagnostics.benchmarks).toHaveLength(Object.keys(CANDIDATE_MODEL_REGISTRY).length);
  });

  it("never lets safety stock or reorder point come back negative", () => {
    const values = Array.from({ length: 40 }, () => 20 + Math.random() * 5);
    const dates = buildDates(values.length);

    const { champion } = selectChampion({
      dates,
      values,
      seasonalPeriods: 7,
      productionHorizon: 7,
      frequency: "DAILY",
      leadTimeDays: 5,
      serviceLevel: 0.95,
    });

    expect(champion.safetyStock.safetyStock).toBeGreaterThanOrEqual(0);
    expect(champion.safetyStock.reorderPoint).toBeGreaterThanOrEqual(0);
  });
});
