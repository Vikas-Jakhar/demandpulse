import type { ForecastPoint, ForecastRequest } from "@/types";

/**
 * Contract for an external forecasting microservice (Prophet, XGBoost,
 * LightGBM, a custom PyTorch model, etc). DemandPulse's in-app Holt-Winters
 * engine is always available as a zero-dependency fallback; this adapter
 * lets an ANALYST/ADMIN point a given series at a heavier external model
 * without changing anything in the dashboard or copilot layers, since both
 * consume the same `ForecastPoint[]` shape either way.
 *
 * Expected external service contract (POST JSON, application/json):
 *
 *   Request:
 *   {
 *     "series_key": string,
 *     "dates": string[],           // ISO dates, historical
 *     "values": number[],          // historical target values, same length as dates
 *     "regressors": Record<string, number[]> | null,
 *     "horizon": number,
 *     "frequency": "DAILY" | "WEEKLY" | "MONTHLY",
 *     "confidence_levels": number[]  // e.g. [0.8, 0.95]
 *   }
 *
 *   Response:
 *   {
 *     "points": [
 *       {
 *         "date": string,
 *         "forecast": number,
 *         "lower_80": number, "upper_80": number,
 *         "lower_95": number, "upper_95": number
 *       }, ...
 *     ],
 *     "model_name": string,        // e.g. "prophet-v1.1", "xgboost-quantile"
 *     "model_version": string
 *   }
 */

export interface ExternalModelRequest {
  series_key: string;
  dates: string[];
  values: number[];
  regressors: Record<string, number[]> | null;
  horizon: number;
  frequency: ForecastRequest["frequency"];
  confidence_levels: number[];
}

export interface ExternalModelResponsePoint {
  date: string;
  forecast: number;
  lower_80: number;
  upper_80: number;
  lower_95: number;
  upper_95: number;
}

export interface ExternalModelResponse {
  points: ExternalModelResponsePoint[];
  model_name: string;
  model_version: string;
}

export class ExternalModelError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "ExternalModelError";
  }
}

/**
 * Calls a configured external forecasting microservice and normalizes its
 * response into DemandPulse's internal `ForecastPoint[]` shape so it can be
 * merged with the historical actuals/fitted array from the in-app engine.
 *
 * Set EXTERNAL_FORECAST_MODEL_URL in the environment to enable this path;
 * otherwise callers should fall back to `runForecastPipeline` from
 * `holt-winters.ts`.
 */
export async function callExternalForecastModel(
  request: ExternalModelRequest
): Promise<ForecastPoint[]> {
  const endpoint = process.env.EXTERNAL_FORECAST_MODEL_URL;
  if (!endpoint) {
    throw new ExternalModelError(
      "EXTERNAL_FORECAST_MODEL_URL is not configured; falling back to the in-app engine is recommended."
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.EXTERNAL_FORECAST_MODEL_API_KEY
        ? { Authorization: `Bearer ${process.env.EXTERNAL_FORECAST_MODEL_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(request),
    // Keep external model calls out of the render path's critical timing budget.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new ExternalModelError(
      `External model service responded with ${res.status}`,
      res.status
    );
  }

  const data = (await res.json()) as ExternalModelResponse;

  return data.points.map((p) => ({
    date: p.date,
    actual: null,
    fitted: null,
    forecast: p.forecast,
    lower80: p.lower_80,
    upper80: p.upper_80,
    lower95: p.lower_95,
    upper95: p.upper_95,
  }));
}
