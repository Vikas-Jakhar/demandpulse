import type { ColumnMapping, DetectedColumn, RawRow } from "@/types";

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY or MM/DD/YYYY
  /^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/, // 5-Jan-24
  /^\d{10,13}$/, // Unix timestamp (s or ms)
];

const TARGET_HINTS = ["demand", "volume", "units", "sold", "qty", "quantity", "sales", "orders"];
const SERIES_KEY_HINTS = ["sku", "product", "item", "category", "store", "region"];
const REGRESSOR_HINTS = ["promo", "price", "holiday", "stockout", "discount", "marketing", "event"];

function looksLikeDate(value: string | number): boolean {
  const s = String(value).trim();
  return DATE_PATTERNS.some((p) => p.test(s)) || !isNaN(Date.parse(s));
}

function looksNumeric(value: string | number): boolean {
  if (typeof value === "number") return true;
  const s = String(value).trim().replace(/,/g, "");
  return s !== "" && !isNaN(Number(s));
}

/**
 * Inspects up to `sampleSize` rows per column and infers its semantic type.
 * This drives the auto-mapping UI so a user rarely has to hand-pick columns.
 */
export function detectColumns(rows: RawRow[], sampleSize = 25): DetectedColumn[] {
  if (rows.length === 0) return [];
  const columnNames = Object.keys(rows[0]);
  const sample = rows.slice(0, sampleSize);

  return columnNames.map((name) => {
    const values = sample.map((r) => r[name]).filter((v) => v !== null && v !== "");
    const sampleValues = values.slice(0, 5) as (string | number)[];

    if (values.length === 0) {
      return { name, sampleValues: [], inferredType: "unknown", confidence: 0 };
    }

    const dateHits = values.filter(
      (value) => value !== null && value !== "" && looksLikeDate(value)
      ).length;

    const numericHits = values.filter(
      (value) => value !== null && value !== "" && looksNumeric(value)
      ).length;
    const dateRatio = dateHits / values.length;
    const numericRatio = numericHits / values.length;

    if (dateRatio >= 0.8) {
      return { name, sampleValues, inferredType: "date", confidence: dateRatio };
    }
    if (numericRatio >= 0.8) {
      return { name, sampleValues, inferredType: "numeric", confidence: numericRatio };
    }
    return { name, sampleValues, inferredType: "categorical", confidence: 1 - Math.max(dateRatio, numericRatio) };
  });
}

/** Scores a column name against a hint list, rewarding exact and substring matches. */
function nameScore(columnName: string, hints: string[]): number {
  const lower = columnName.toLowerCase().replace(/[_\-\s]/g, "");
  let best = 0;
  for (const hint of hints) {
    if (lower === hint) best = Math.max(best, 1);
    else if (lower.includes(hint)) best = Math.max(best, 0.7);
  }
  return best;
}

/**
 * Produces a best-guess ColumnMapping by combining inferred type with
 * column-name heuristics. The UI presents this as an editable suggestion,
 * never a silent, un-overridable decision.
 */
export function autoMapColumns(detected: DetectedColumn[]): ColumnMapping {
  const dateCandidates = detected.filter((c) => c.inferredType === "date");
  const numericCandidates = detected.filter((c) => c.inferredType === "numeric");
  const categoricalCandidates = detected.filter((c) => c.inferredType === "categorical");

  const dateColumn =
    dateCandidates.sort((a, b) => b.confidence - a.confidence)[0]?.name ?? null;

  const targetColumn =
    numericCandidates
      .map((c) => ({ c, score: nameScore(c.name, TARGET_HINTS) + c.confidence * 0.1 }))
      .sort((a, b) => b.score - a.score)[0]?.c.name ?? numericCandidates[0]?.name ?? null;

  const seriesKeyColumn =
    categoricalCandidates
      .map((c) => ({ c, score: nameScore(c.name, SERIES_KEY_HINTS) }))
      .sort((a, b) => b.score - a.score)[0]?.c.name ?? null;

  const regressorColumns = numericCandidates
    .filter((c) => c.name !== targetColumn)
    .filter((c) => nameScore(c.name, REGRESSOR_HINTS) > 0)
    .map((c) => c.name);

  return { dateColumn, targetColumn, seriesKeyColumn, regressorColumns };
}

/** Normalizes any of the supported date formats (incl. Unix epoch) to an ISO date string. */
export function normalizeDate(raw: string | number): string | null {
  if (typeof raw === "number" || /^\d{10,13}$/.test(String(raw))) {
    const num = Number(raw);
    const ms = String(raw).length <= 10 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const s = String(raw).trim();

  // DD/MM/YYYY — disambiguate from MM/DD/YYYY by checking if the first segment > 12.
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    const day = Number(first) > 12 ? first : second;
    const month = Number(first) > 12 ? second : first;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}
