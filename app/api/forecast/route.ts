import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { selectChampion } from "@/lib/forecasting/selector";
import { getCurrentSession } from "@/lib/auth/session";

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
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  try {
    const { champion, diagnostics } = selectChampion({
      dates: parsed.dates,
      values: parsed.values,
      seasonalPeriods: parsed.seasonalPeriods,
      productionHorizon: parsed.horizon,
      frequency: parsed.frequency,
      growthAdjustmentPct: parsed.growthAdjustmentPct,
      criteria: { primaryMetric: parsed.primaryMetric },
      leadTimeDays: parsed.leadTimeDays,
      serviceLevel: parsed.serviceLevel,
    });

    return NextResponse.json({ champion, diagnostics });
  } catch (err) {
    console.error("Champion selection pipeline error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Forecast computation failed." },
      { status: 500 }
    );
  }
}
