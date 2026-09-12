import { describe, it, expect } from "vitest";
import { inverseNormalCdf, calculateSafetyStock, seriesStats } from "@/lib/forecasting/safety-stock";

describe("inverseNormalCdf", () => {
  it("returns ~0 at the median (p=0.5)", () => {
    expect(inverseNormalCdf(0.5)).toBeCloseTo(0, 3);
  });

  it("matches well-known z-scores for common service levels", () => {
    // These are the textbook values every safety-stock calculator is
    // benchmarked against — if this drifts, every downstream reorder point
    // silently drifts with it.
    expect(inverseNormalCdf(0.9)).toBeCloseTo(1.2816, 3);
    expect(inverseNormalCdf(0.95)).toBeCloseTo(1.6449, 3);
    expect(inverseNormalCdf(0.99)).toBeCloseTo(2.3263, 3);
  });

  it("is symmetric around 0.5", () => {
    const z = inverseNormalCdf(0.8);
    const zComplement = inverseNormalCdf(0.2);
    expect(zComplement).toBeCloseTo(-z, 6);
  });

  it("throws for probabilities outside (0, 1)", () => {
    expect(() => inverseNormalCdf(0)).toThrow();
    expect(() => inverseNormalCdf(1)).toThrow();
    expect(() => inverseNormalCdf(-0.1)).toThrow();
  });
});

describe("calculateSafetyStock", () => {
  it("increases safety stock as the required service level increases", () => {
    const base = { avgDailyDemand: 100, demandStdDev: 20, leadTimeDays: 7 };
    const low = calculateSafetyStock({ ...base, serviceLevel: 0.8 });
    const mid = calculateSafetyStock({ ...base, serviceLevel: 0.95 });
    const high = calculateSafetyStock({ ...base, serviceLevel: 0.99 });

    expect(mid.safetyStock).toBeGreaterThan(low.safetyStock);
    expect(high.safetyStock).toBeGreaterThan(mid.safetyStock);
  });

  it("increases safety stock as demand variability increases, all else equal", () => {
    const steady = calculateSafetyStock({
      avgDailyDemand: 100,
      demandStdDev: 5,
      leadTimeDays: 7,
      serviceLevel: 0.95,
    });
    const volatile = calculateSafetyStock({
      avgDailyDemand: 100,
      demandStdDev: 40,
      leadTimeDays: 7,
      serviceLevel: 0.95,
    });
    expect(volatile.safetyStock).toBeGreaterThan(steady.safetyStock);
  });

  it("computes reorder point as lead-time demand plus safety stock", () => {
    const result = calculateSafetyStock({
      avgDailyDemand: 50,
      demandStdDev: 10,
      leadTimeDays: 5,
      serviceLevel: 0.95,
    });
    // reorderPoint = avgDailyDemand * leadTimeDays + safetyStock, by definition.
    expect(result.reorderPoint).toBe(Math.round(50 * 5 + result.safetyStock));
  });

  it("accounts for lead-time variability when provided, not just demand variability", () => {
    const withoutLeadTimeVariance = calculateSafetyStock({
      avgDailyDemand: 100,
      demandStdDev: 15,
      leadTimeDays: 7,
      serviceLevel: 0.95,
    });
    const withLeadTimeVariance = calculateSafetyStock({
      avgDailyDemand: 100,
      demandStdDev: 15,
      leadTimeDays: 7,
      leadTimeStdDev: 2,
      serviceLevel: 0.95,
    });
    // Adding lead-time uncertainty on top of demand uncertainty should only
    // ever increase the required buffer, never shrink it.
    expect(withLeadTimeVariance.safetyStock).toBeGreaterThan(withoutLeadTimeVariance.safetyStock);
  });
});

describe("seriesStats", () => {
  it("computes mean and sample standard deviation correctly", () => {
    const { mean, stdDev } = seriesStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(mean).toBeCloseTo(5, 6);
    // Known sample stdDev for this textbook dataset is 2.13809...
    expect(stdDev).toBeCloseTo(2.1381, 3);
  });

  it("returns zeros for an empty series rather than NaN", () => {
    expect(seriesStats([])).toEqual({ mean: 0, stdDev: 0 });
  });
});
