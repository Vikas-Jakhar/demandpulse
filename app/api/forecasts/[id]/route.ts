import { NextResponse } from "next/server";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { requireForecastOwnership, ForbiddenError } from "@/lib/auth/ownership";
import { loadForecastDetail } from "@/lib/forecasting/persist";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: { id: string };
}

/** GET /api/forecasts/[id] — loads one saved forecast run with its full point history. */
export async function GET(_req: Request, { params }: RouteParams) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  try {
    await requireForecastOwnership(params.id, session.sub);
    const forecast = await loadForecastDetail(params.id);
    return NextResponse.json({ forecast });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forecast not found." }, { status: 404 });
    }
    console.error("Forecast detail error:", err);
    return NextResponse.json({ error: "Failed to load forecast." }, { status: 500 });
  }
}

/** DELETE /api/forecasts/[id] — removes a forecast run and its points. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  try {
    await requireForecastOwnership(params.id, session.sub);
    await prisma.forecast.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forecast not found." }, { status: 404 });
    }
    console.error("Forecast delete error:", err);
    return NextResponse.json({ error: "Failed to delete forecast." }, { status: 500 });
  }
}
