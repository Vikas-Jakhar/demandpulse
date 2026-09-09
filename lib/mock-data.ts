import type { Dataset, TimeSeriesPoint } from "@/types";

/**
 * Generates a realistic, seeded (deterministic) demand series with weekly
 * seasonality, a mild upward trend, occasional promo spikes, and a handful
 * of injected outliers — so the dashboard has something meaningful to show
 * before a user uploads their own file, and so the cleaning pipeline has
 * something real to demonstrate on.
 */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const SKUS = ["SKU-102", "SKU-238", "SKU-409", "SKU-517"];

export function generateMockDataset(days = 240): Dataset {
  const series: TimeSeriesPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  SKUS.forEach((sku, skuIdx) => {
    const rand = seededRandom(42 + skuIdx * 17);
    const base = 120 + skuIdx * 60;
    const trendSlope = 0.15 + skuIdx * 0.05;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();

      // Weekly seasonality: weekends lift for consumer SKUs.
      const weekendLift = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 1.0;
      const trend = base + trendSlope * i;
      const noise = (rand() - 0.5) * base * 0.12;

      // Promo spike roughly every 5 weeks, and SKU-409 gets a deliberate week-3-of-month spike
      // for the copilot demo question ("why does SKU-409 spike in week 3?").
      const isPromoWeek = i % 35 >= 33;
      const isSku409SpikeWeek = sku === "SKU-409" && Math.floor(i / 7) % 4 === 2;
      const promoBoost = isPromoWeek || isSku409SpikeWeek ? base * 0.6 : 0;

      let value = Math.max(0, trend * weekendLift + noise + promoBoost);

      // Inject a few sharp outliers for the cleaning-pipeline demo.
      const isOutlier = i > 10 && i % 53 === 0;
      if (isOutlier) value *= 2.4;

      series.push({
        date: date.toISOString().slice(0, 10),
        value: Math.round(value),
        seriesKey: sku,
        regressors: {
          promo: isPromoWeek || isSku409SpikeWeek ? 1 : 0,
          holiday: dayOfWeek === 0 ? 1 : 0,
        },
        isOutlier,
      });
    }
  });

  return {
    id: "mock-dataset",
    name: "Sample Retail Demand (demo data)",
    uploadedAt: new Date().toISOString(),
    frequency: "DAILY",
    columnMapping: {
      dateColumn: "date",
      targetColumn: "units_sold",
      seriesKeyColumn: "sku",
      regressorColumns: ["promo", "holiday"],
    },
    cleaningReport: {
      totalRows: series.length,
      nullsImputed: 6,
      outliersFlagged: series.filter((s) => s.isOutlier).length,
      outliersCapped: series.filter((s) => s.isOutlier).length,
      outliersExcluded: 0,
      resampledFrom: "DAILY",
      resampledTo: "DAILY",
    },
    series,
    seriesKeys: SKUS,
  };
}
