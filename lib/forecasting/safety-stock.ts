import type { SafetyStockInput, SafetyStockResult } from "@/types";

/**
 * Service-level → z-score lookup for the safety-stock formula.
 * Uses a rational approximation of the inverse normal CDF (Acklam's algorithm,
 * abbreviated) so arbitrary service levels (e.g. 97.5%) don't require a table.
 */
export function inverseNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error("Service level must be between 0 and 1 (exclusive).");
  }
  // Beasley-Springer-Moro approximation.
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= 1 - pLow) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/**
 * Safety stock combining demand variability and (optionally) lead-time
 * variability, using the standard combined-variance formula:
 *
 *   SS = z * sqrt( (leadTime * demandStdDev^2) + (avgDemand^2 * leadTimeStdDev^2) )
 *
 * When lead-time variability is unknown, it degrades gracefully to the
 * simpler SS = z * demandStdDev * sqrt(leadTime) form.
 */
export function calculateSafetyStock(input: SafetyStockInput): SafetyStockResult {
  const { avgDailyDemand, demandStdDev, leadTimeDays, leadTimeStdDev, serviceLevel } = input;
  const z = inverseNormalCdf(serviceLevel);

  let safetyStock: number;
  if (leadTimeStdDev && leadTimeStdDev > 0) {
    const demandVarianceTerm = leadTimeDays * demandStdDev ** 2;
    const leadTimeVarianceTerm = avgDailyDemand ** 2 * leadTimeStdDev ** 2;
    safetyStock = z * Math.sqrt(demandVarianceTerm + leadTimeVarianceTerm);
  } else {
    safetyStock = z * demandStdDev * Math.sqrt(leadTimeDays);
  }

  const reorderPoint = avgDailyDemand * leadTimeDays + safetyStock;

  return {
    zScore: Math.round(z * 1000) / 1000,
    safetyStock: Math.round(safetyStock),
    reorderPoint: Math.round(reorderPoint),
  };
}

/** Basic descriptive stats used to feed calculateSafetyStock from a raw time series. */
export function seriesStats(values: number[]): { mean: number; stdDev: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / Math.max(1, n - 1);
  return { mean, stdDev: Math.sqrt(variance) };
}
