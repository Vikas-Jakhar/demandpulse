import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { selectChampion } from "@/lib/forecasting/selector";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { requireDatasetOwnership, ForbiddenError } from "@/lib/auth/ownership";
import { persistForecast } from "@/lib/forecasting/persist";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  dates: z.array(z.string()).min(8, "At least 8 historical points are required to backtest candidate models."),
  values: z.array(z.number()),
  seriesKey: z.string(),
  horizon: z.number().min(1).max(730),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  seasonalPeriods: z.number().min(2).max(365),
  growthAdjustmentPct: z.number().min(-90).max(500).default(0),
  leadTimeDays: z.number().min(0).max(365).default(7),
  serviceLevel: z.number().min(0.5).max(0.999).default(0.95),
  primaryMetric: z.enum(["WAPE", "MAPE", "RMSE"]).default("WAPE"),
  // Which precomputed band (80% or 95%) gets persisted to ForecastPoint —
  // the schema stores one band per Forecast, not both simultaneously.
  confidenceLevel: z.union([z.literal(0.8), z.literal(0.95)]).default(0.95),
  // The dataset this run belongs to, so it can be saved to history. Optional
  // because a client-side-only preview (mock demo data, an upload that
  // failed to persist) has an id that doesn't correspond to a real Dataset
  // row — persistence is best-effort in that case, not a hard requirement
  // for getting a forecast back.
  datasetId: z.string().optional(),
});

/**
 * Runs the Champion Model pipeline (lib/forecasting/selector.ts): backtests
 * every candidate on a holdout split, ranks by the primary metric (WAPE by
 * default), refits the winner on the full series, and returns two separate
 * objects — `champion` (the only thing the main dashboard should render)
 * and `diagnostics` (benchmark table + comparison data, for the audit
 * drawer only). Keeping them as separate top-level keys in the response —
 * rather than one merged blob — makes it hard for a future dashboard change
 * to accidentally render the diagnostics payload on the primary screen.
 *
 * After computing the result, this also best-effort persists it as a
 * Forecast + ForecastPoint history entry (Phase 6). "Best-effort" is
 * deliberate: a forecast is still useful to see even if it can't be saved
 * (guest session, or a `datasetId` that isn't a real owned Dataset row —
 * e.g. the auto-loaded demo dataset). Persistence failing never fails the
 * request; the response just reports `persisted: false`.
 */
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  const limited = enforceRateLimit("forecast", session.sub);
  if (limited) return limited;

  let parsed;
  try {
    const body = await req.json();
    parsed = requestSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (parsed.dates.length !== parsed.values.length) {
    return NextResponse.json({ error: "dates[] and values[] must be the same length." }, { status: 400 });
  }

  let champion, diagnostics;
  try {
    ({ champion, diagnostics } = selectChampion({
      dates: parsed.dates,
      values: parsed.values,
      seasonalPeriods: parsed.seasonalPeriods,
      productionHorizon: parsed.horizon,
      frequency: parsed.frequency,
      growthAdjustmentPct: parsed.growthAdjustmentPct,
      criteria: { primaryMetric: parsed.primaryMetric },
      leadTimeDays: parsed.leadTimeDays,
      serviceLevel: parsed.serviceLevel,
    }));
  } catch (err) {
    console.error("Champion selection pipeline error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Forecast computation failed." },
      { status: 500 }
    );
  }

  let persisted = false;
  let forecastId: string | null = null;

  if (!session.isGuest && parsed.datasetId) {
    try {
      await requireDatasetOwnership(parsed.datasetId, session.sub);
      const saved = await persistForecast({
        userId: session.sub,
        datasetId: parsed.datasetId,
        sku: parsed.seriesKey,
        horizon: parsed.horizon,
        confidenceLevel: parsed.confidenceLevel,
        champion,
        leadTimeDays: parsed.leadTimeDays,
      });
      persisted = true;
      forecastId = saved.id;
    } catch (err) {
      // ForbiddenError means the datasetId isn't a real, owned row (e.g.
      // the client-side demo dataset) — expected and silent. Anything else
      // is a genuine persistence failure, worth logging but still not worth
      // failing the whole request over; the user still gets their forecast.
      if (!(err instanceof ForbiddenError)) {
        console.error("Forecast persistence error:", err);
      }
    }
  }

  return NextResponse.json({ champion, diagnostics, persisted, forecastId });
}
