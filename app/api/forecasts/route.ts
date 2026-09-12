import { NextRequest, NextResponse } from "next/server";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { listForecastsForUser } from "@/lib/forecasting/persist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
/** GET /api/forecasts?datasetId=... — lists the current user's saved forecast runs, newest first. */
export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  if (session.isGuest) {
    return NextResponse.json({ forecasts: [] });
  }

  const datasetId = req.nextUrl.searchParams.get("datasetId") ?? undefined;

  try {
    const forecasts = await listForecastsForUser(session.sub, datasetId);
    return NextResponse.json({ forecasts });
  } catch (err) {
    console.error("Forecast list error:", err);
    return NextResponse.json({ error: "Failed to load forecast history." }, { status: 500 });
  }
}
