// ─────────────────────────────────────────────────────────────────────────
// DemandPulse — Core Domain Types
// ─────────────────────────────────────────────────────────────────────────

// Note: role/organization fields were dropped from this type when the
// Prisma schema moved to a leaner single-tenant User model (Phase 1). The
// previous Viewer/Analyst/Admin gating on the dashboard is now a simple
// `isGuest` check instead — reintroduce a Role enum on both sides together
// if/when multi-tenant RBAC becomes a real requirement.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  isGuest?: boolean;
  exp: number;
}

// ── Ingestion ───────────────────────────────────────────────────────────

export type DateFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface RawRow {
  [column: string]: string | number | null;
}

export interface ColumnMapping {
  dateColumn: string | null;
  targetColumn: string | null;
  seriesKeyColumn: string | null; // SKU / Product / Category
  regressorColumns: string[]; // promo, price, holiday flag, stockout flag, etc.
}

export interface DetectedColumn {
  name: string;
  sampleValues: (string | number)[];
  inferredType: "date" | "numeric" | "categorical" | "unknown";
  confidence: number; // 0..1
}

export interface CleaningOptions {
  imputationStrategy: "NONE" | "FORWARD_FILL" | "MEAN" | "MEDIAN";
  outlierMethod: "NONE" | "IQR" | "ZSCORE";
  outlierAction: "CAP" | "EXCLUDE";
  targetFrequency: DateFrequency;
}

export interface CleaningReport {
  totalRows: number;
  nullsImputed: number;
  outliersFlagged: number;
  outliersCapped: number;
  outliersExcluded: number;
  resampledFrom: DateFrequency | null;
  resampledTo: DateFrequency;
}

export interface TimeSeriesPoint {
  date: string; // ISO date
  value: number;
  seriesKey: string; // e.g. SKU id, "ALL" if ungrouped
  regressors?: Record<string, number>;
  isImputed?: boolean;
  isOutlier?: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  uploadedAt: string;
  frequency: DateFrequency;
  columnMapping: ColumnMapping;
  cleaningReport: CleaningReport;
  series: TimeSeriesPoint[];
  seriesKeys: string[]; // distinct SKUs/categories present
}

// ── Forecasting engine ──────────────────────────────────────────────────

export type ForecastHorizonUnit = "DAYS" | "WEEKS" | "MONTHS";

export interface ForecastRequest {
  seriesKey: string;
  horizon: number;
  horizonUnit: ForecastHorizonUnit;
  frequency: DateFrequency;
  seasonalPeriods: number; // e.g. 7 for daily-weekly, 12 for monthly-yearly
  seasonalityMode: "ADDITIVE" | "MULTIPLICATIVE";
  confidenceLevels: number[]; // e.g. [0.8, 0.95]
  growthAdjustmentPct?: number; // scenario slider, e.g. +15 for promo boost
}

export interface HoltWintersParams {
  alpha: number; // level smoothing
  beta: number; // trend smoothing
  gamma: number; // seasonal smoothing
}

export interface ForecastPoint {
  date: string;
  actual: number | null; // null in the future horizon
  fitted: number | null; // in-sample fitted value, null for forecast horizon
  forecast: number | null; // out-of-sample forecast, null for historical range
  lower80: number | null;
  upper80: number | null;
  lower95: number | null;
  upper95: number | null;
}

export interface ErrorMetrics {
  mape: number; // %
  rmse: number;
  mae: number;
  wape: number; // %
  bias: number; // signed mean error, + = over-forecasting historically
  trackingSignal: number; // running sum of errors / MAD
}

export interface Decomposition {
  date: string;
  trend: number | null;
  seasonal: number | null;
  residual: number | null;
}

export interface SafetyStockInput {
  avgDailyDemand: number;
  demandStdDev: number;
  leadTimeDays: number;
  leadTimeStdDev?: number;
  serviceLevel: number; // 0..1, e.g. 0.95
}

export interface SafetyStockResult {
  zScore: number;
  safetyStock: number;
  reorderPoint: number;
}

export interface ForecastRun {
  id: string;
  datasetId: string;
  seriesKey: string;
  createdAt: string;
  request: ForecastRequest;
  params: HoltWintersParams;
  points: ForecastPoint[];
  decomposition: Decomposition[];
  metrics: ErrorMetrics;
  safetyStock: SafetyStockResult;
}

// ── Champion Model Selection ─────────────────────────────────────────────
// The dashboard never shows a user a lineup of competing models. Behind the
// scenes, several candidates are backtested and ranked; only the winner
// ("champion") and its forecast are surfaced to the primary view. Everything
// below this point exists to support that split cleanly: `ChampionPayload`
// is the only thing the main dashboard consumes, `BenchmarkResult[]` is only
// ever consumed by the diagnostics drawer (and, if asked, the copilot).

export type CandidateModelId =
  | "NAIVE"
  | "MOVING_AVERAGE"
  | "HOLT_WINTERS_ADDITIVE"
  | "HOLT_WINTERS_MULTIPLICATIVE"
  | "LINEAR_TREND_BASELINE"; // stand-in slot for an external Prophet/Auto-ARIMA microservice call

export interface CandidateModelMeta {
  id: CandidateModelId;
  displayName: string; // business-facing name shown only in diagnostics, never on the main dashboard
}

export const CANDIDATE_MODEL_REGISTRY: Record<CandidateModelId, CandidateModelMeta> = {
  NAIVE: { id: "NAIVE", displayName: "Seasonal Naive" },
  MOVING_AVERAGE: { id: "MOVING_AVERAGE", displayName: "Seasonal Weighted Moving Average" },
  HOLT_WINTERS_ADDITIVE: { id: "HOLT_WINTERS_ADDITIVE", displayName: "Triple Exponential (Additive)" },
  HOLT_WINTERS_MULTIPLICATIVE: { id: "HOLT_WINTERS_MULTIPLICATIVE", displayName: "Triple Exponential (Seasonal)" },
  LINEAR_TREND_BASELINE: { id: "LINEAR_TREND_BASELINE", displayName: "Linear Trend Baseline" },
};

/** Backtest result for a single candidate, evaluated against a held-out validation window. */
export interface BenchmarkResult {
  modelId: CandidateModelId;
  displayName: string;
  metrics: ErrorMetrics;
  executionTimeMs: number;
  isChampion: boolean;
  holdoutPoints: { date: string; actual: number; predicted: number }[];
}

export interface SelectionCriteria {
  primaryMetric: "WAPE" | "MAPE" | "RMSE";
  minAccuracyThreshold?: number; // e.g. 0.7 → require ≥70% (1 - metric) before trusting the champion
}

/**
 * The ONLY payload the primary dashboard is allowed to render from.
 * No competing model lines, no raw metric dumps — a business-facing
 * confidence score and the single winning projection.
 */
export interface ChampionPayload {
  championModelId: CandidateModelId;
  championDisplayName: string;
  forecastReliabilityPct: number; // business-facing framing of (1 - WAPE), e.g. 94.2
  points: ForecastPoint[];
  decomposition: Decomposition[];
  metrics: ErrorMetrics; // retained for the copilot / audit trail, not rendered raw on the main view
  safetyStock: SafetyStockResult;
  selectionCriteria: SelectionCriteria;
}

/** Full diagnostics bundle — consumed only by the secondary audit drawer/tab. */
export interface DiagnosticsPayload {
  champion: ChampionPayload;
  benchmarks: BenchmarkResult[]; // includes the champion's own backtest row for the comparison table
  holdoutWindow: { start: string; end: string; periods: number };
}

// ── Copilot ──────────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface CopilotContext {
  datasetName: string;
  seriesKey: string;
  frequency: DateFrequency;
  horizon: number;
  championModelId: CandidateModelId;
  championDisplayName: string;
  forecastReliabilityPct: number;
  metrics: ErrorMetrics;
  totalPredictedDemand: number;
  outlierCount: number;
  recentAnomalies: { date: string; value: number; deviation: number }[];
  safetyStock: SafetyStockResult;
  // Only populated so the copilot CAN answer "why was this model chosen" if
  // asked — never surfaced on the main dashboard, and the system prompt
  // instructs the model not to volunteer it unprompted.
  benchmarks?: BenchmarkResult[];
}
