import type {
  CleaningOptions,
  CleaningReport,
  ColumnMapping,
  DateFrequency,
  RawRow,
  TimeSeriesPoint,
} from "@/types";
import { normalizeDate } from "./column-detector";

/**
 * Converts raw parsed rows into normalized TimeSeriesPoint[] using the
 * confirmed column mapping, then runs imputation, outlier handling, and
 * frequency resampling per the given options. Returns both the cleaned
 * series and an audit report the UI shows to the user (nothing silently
 * dropped without disclosure).
 */
export function buildAndCleanSeries(
  rows: RawRow[],
  mapping: ColumnMapping,
  options: CleaningOptions
): { series: TimeSeriesPoint[]; report: CleaningReport } {
  if (!mapping.dateColumn || !mapping.targetColumn) {
    throw new Error("Date and target columns must be mapped before cleaning.");
  }

  const totalRows = rows.length;
  let nullsImputed = 0;

  // Step 1: normalize into raw points, grouped by series key.
  const rawPoints: TimeSeriesPoint[] = [];
  for (const row of rows) {
    const rawDate = row[mapping.dateColumn];
    if (rawDate === null || rawDate === undefined || rawDate === "") continue;
    const date = normalizeDate(rawDate as string | number);
    if (!date) continue;

    const rawValue = row[mapping.targetColumn];
    const value = rawValue === null || rawValue === "" || rawValue === undefined ? NaN : Number(rawValue);

    const seriesKey = mapping.seriesKeyColumn
      ? String(row[mapping.seriesKeyColumn] ?? "UNSPECIFIED")
      : "ALL";

    const regressors: Record<string, number> = {};
    for (const col of mapping.regressorColumns) {
      const v = row[col];
      if (v !== null && v !== undefined && v !== "") regressors[col] = Number(v);
    }

    rawPoints.push({ date, value, seriesKey, regressors });
  }

  // Step 2: sort per series by date, then impute missing/NaN values.
  const bySeries = groupBySeries(rawPoints);
  const imputed: TimeSeriesPoint[] = [];

  for (const [, points] of bySeries) {
    points.sort((a, b) => a.date.localeCompare(b.date));
    const values = points.map((p) => p.value);
    const validValues = values.filter((v) => !isNaN(v));
    const mean = validValues.reduce((a, b) => a + b, 0) / (validValues.length || 1);
    const median = computeMedian(validValues);

    let lastValid = mean;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (isNaN(p.value)) {
        nullsImputed++;
        p.isImputed = true;
        if (options.imputationStrategy === "FORWARD_FILL") p.value = lastValid;
        else if (options.imputationStrategy === "MEAN") p.value = mean;
        else if (options.imputationStrategy === "MEDIAN") p.value = median;
        else p.value = 0; // NONE: treat missing as zero demand rather than dropping the date
      } else {
        lastValid = p.value;
      }
      imputed.push(p);
    }
  }

  // Step 3: outlier detection per series.
  let outliersFlagged = 0;
  let outliersCapped = 0;
  let outliersExcluded = 0;
  const bySeriesImputed = groupBySeries(imputed);
  let cleaned: TimeSeriesPoint[] = [];

  for (const [, points] of bySeriesImputed) {
    const values = points.map((p) => p.value);
    const bounds =
      options.outlierMethod === "IQR"
        ? iqrBounds(values)
        : options.outlierMethod === "ZSCORE"
        ? zscoreBounds(values)
        : null;

    for (const p of points) {
      if (bounds && (p.value < bounds.lower || p.value > bounds.upper)) {
        outliersFlagged++;
        p.isOutlier = true;
        if (options.outlierAction === "CAP") {
          p.value = Math.min(Math.max(p.value, bounds.lower), bounds.upper);
          outliersCapped++;
        } else {
          outliersExcluded++;
          continue; // drop from cleaned output
        }
      }
      cleaned.push(p);
    }
  }

  // Step 4: resample to target frequency (aggregate by sum, the standard convention for demand volume).
  const inferredFrequency = inferFrequency(cleaned);
  cleaned = resample(cleaned, options.targetFrequency);

  const report: CleaningReport = {
    totalRows,
    nullsImputed,
    outliersFlagged,
    outliersCapped,
    outliersExcluded,
    resampledFrom: inferredFrequency,
    resampledTo: options.targetFrequency,
  };

  return { series: cleaned, report };
}

function groupBySeries(points: TimeSeriesPoint[]): Map<string, TimeSeriesPoint[]> {
  const map = new Map<string, TimeSeriesPoint[]>();
  for (const p of points) {
    if (!map.has(p.seriesKey)) map.set(p.seriesKey, []);
    map.get(p.seriesKey)!.push(p);
  }
  return map;
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function iqrBounds(values: number[]): { lower: number; upper: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const iqr = q3 - q1;
  return { lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr };
}

function zscoreBounds(values: number[], threshold = 3): { lower: number; upper: number } {
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length || 1);
  const stdDev = Math.sqrt(variance);
  return { lower: mean - threshold * stdDev, upper: mean + threshold * stdDev };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Infers the dominant frequency of a series by the median day-gap between points. */
function inferFrequency(points: TimeSeriesPoint[]): DateFrequency {
  const dates = [...new Set(points.map((p) => p.date))].sort();
  if (dates.length < 2) return "DAILY";
  const gaps = dates.slice(1).map((d, i) => {
    const diff = new Date(d).getTime() - new Date(dates[i]).getTime();
    return diff / (24 * 60 * 60 * 1000);
  });
  const medianGap = computeMedian(gaps);
  if (medianGap <= 2) return "DAILY";
  if (medianGap <= 10) return "WEEKLY";
  return "MONTHLY";
}

/** Aggregates points into the target frequency bucket (sum of demand within each bucket). */
function resample(points: TimeSeriesPoint[], target: DateFrequency): TimeSeriesPoint[] {
  const buckets = new Map<string, TimeSeriesPoint[]>();

  for (const p of points) {
    const bucketKey = `${p.seriesKey}::${bucketFor(p.date, target)}`;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey)!.push(p);
  }

  const result: TimeSeriesPoint[] = [];
  for (const [key, group] of buckets) {
    const seriesKey = key.split("::")[0];
    const bucketDate = bucketFor(group[0].date, target);
    const value = group.reduce((sum, p) => sum + p.value, 0);
    const isImputed = group.some((p) => p.isImputed);
    const isOutlier = group.some((p) => p.isOutlier);
    const regressors = group.reduce<Record<string, number>>((acc, p) => {
      for (const [k, v] of Object.entries(p.regressors ?? {})) {
        acc[k] = (acc[k] ?? 0) + v;
      }
      return acc;
    }, {});
    result.push({ date: bucketDate, value, seriesKey, isImputed, isOutlier, regressors });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function bucketFor(dateStr: string, target: DateFrequency): string {
  const d = new Date(dateStr);
  if (target === "DAILY") return d.toISOString().slice(0, 10);
  if (target === "MONTHLY") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;

  // WEEKLY: bucket to the Monday of that ISO week.
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}
