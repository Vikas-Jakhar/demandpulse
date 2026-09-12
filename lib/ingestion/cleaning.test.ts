import { describe, it, expect } from "vitest";
import { buildAndCleanSeries } from "@/lib/ingestion/cleaning";
import type { ColumnMapping, CleaningOptions, RawRow } from "@/types";

const baseMapping: ColumnMapping = {
  dateColumn: "date",
  targetColumn: "units",
  seriesKeyColumn: "sku",
  regressorColumns: [],
};

const baseOptions: CleaningOptions = {
  imputationStrategy: "FORWARD_FILL",
  outlierMethod: "IQR",
  outlierAction: "CAP",
  targetFrequency: "DAILY",
};

function row(date: string, units: number | null, sku = "SKU-1"): RawRow {
  return { date, units, sku };
}

describe("buildAndCleanSeries", () => {
  it("forward-fills a missing value from the last valid observation", () => {
    const rows = [row("2024-01-01", 10), row("2024-01-02", null), row("2024-01-03", 14)];
    const { series, report } = buildAndCleanSeries(rows, baseMapping, baseOptions);

    const jan2 = series.find((p) => p.date === "2024-01-02");
    expect(jan2?.value).toBe(10); // carried forward from Jan 1
    expect(jan2?.isImputed).toBe(true);
    expect(report.nullsImputed).toBe(1);
  });

  it("imputes with the series mean when MEAN strategy is selected", () => {
    const rows = [row("2024-01-01", 10), row("2024-01-02", null), row("2024-01-03", 20)];
    const { series } = buildAndCleanSeries(rows, baseMapping, { ...baseOptions, imputationStrategy: "MEAN" });
    const jan2 = series.find((p) => p.date === "2024-01-02");
    // Mean of the two valid values (10, 20) = 15.
    expect(jan2?.value).toBe(15);
  });

  it("caps an IQR outlier rather than dropping it, when outlierAction is CAP", () => {
    // A tight cluster around 10 with one wild spike at 1000.
    const rows = [
      row("2024-01-01", 9),
      row("2024-01-02", 11),
      row("2024-01-03", 10),
      row("2024-01-04", 1000),
      row("2024-01-05", 10),
      row("2024-01-06", 9),
    ];
    const { series, report } = buildAndCleanSeries(rows, baseMapping, baseOptions);
    const spike = series.find((p) => p.date === "2024-01-04");

    expect(report.outliersFlagged).toBeGreaterThan(0);
    expect(report.outliersCapped).toBeGreaterThan(0);
    expect(spike?.value).toBeLessThan(1000); // capped down toward the IQR bound
    expect(series).toHaveLength(6); // nothing was dropped
  });

  it("excludes an outlier entirely when outlierAction is EXCLUDE", () => {
    const rows = [
      row("2024-01-01", 9),
      row("2024-01-02", 11),
      row("2024-01-03", 10),
      row("2024-01-04", 1000),
      row("2024-01-05", 10),
      row("2024-01-06", 9),
    ];
    const { series, report } = buildAndCleanSeries(rows, baseMapping, { ...baseOptions, outlierAction: "EXCLUDE" });

    expect(series.find((p) => p.date === "2024-01-04")).toBeUndefined();
    expect(report.outliersExcluded).toBeGreaterThan(0);
    expect(series).toHaveLength(5);
  });

  it("resamples daily data up to weekly by summing within each ISO week", () => {
    // Two full weeks of constant daily demand = 10/day.
    const rows = Array.from({ length: 14 }, (_, i) => {
      const d = new Date("2024-01-01"); // a Monday
      d.setDate(d.getDate() + i);
      return row(d.toISOString().slice(0, 10), 10);
    });
    const { series, report } = buildAndCleanSeries(rows, baseMapping, {
      ...baseOptions,
      targetFrequency: "WEEKLY",
    });

    expect(report.resampledTo).toBe("WEEKLY");
    // 14 days of 10/day → 2 weekly buckets of 70 each.
    expect(series).toHaveLength(2);
    series.forEach((p) => expect(p.value).toBe(70));
  });

  it("keeps separate series (SKUs) from bleeding into each other's cleaning", () => {
    const rows = [
      row("2024-01-01", 10, "SKU-A"),
      row("2024-01-02", null, "SKU-A"),
      row("2024-01-01", 500, "SKU-B"),
      row("2024-01-02", 500, "SKU-B"),
    ];
    const { series } = buildAndCleanSeries(rows, baseMapping, baseOptions);
    const skuAJan2 = series.find((p) => p.seriesKey === "SKU-A" && p.date === "2024-01-02");
    // Forward-filled from SKU-A's own history (10), not influenced by SKU-B's much larger values.
    expect(skuAJan2?.value).toBe(10);
  });

  it("throws a clear error when the date or target column isn't mapped", () => {
    const rows = [row("2024-01-01", 10)];
    expect(() =>
      buildAndCleanSeries(rows, { ...baseMapping, dateColumn: null }, baseOptions)
    ).toThrow();
  });
});
