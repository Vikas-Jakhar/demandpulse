import { NextResponse } from "next/server";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { requireDatasetOwnership, ForbiddenError } from "@/lib/auth/ownership";
import { loadDatasetForClient } from "@/lib/ingestion/persist";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: { id: string };
}

/** GET /api/datasets/[id] — loads a saved dataset back into the client `Dataset` shape. */
export async function GET(_req: Request, { params }: RouteParams) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  try {
    await requireDatasetOwnership(params.id, session.sub);
    const dataset = await loadDatasetForClient(params.id);
    return NextResponse.json({ dataset });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      // Same 404 whether the id is bogus or belongs to someone else — see
      // the reasoning in lib/auth/ownership.ts.
      return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
    }
    console.error("Dataset load error:", err);
    return NextResponse.json({ error: "Failed to load dataset." }, { status: 500 });
  }
}

/** DELETE /api/datasets/[id] — removes a dataset and, via cascade, its rows and forecasts. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  try {
    await requireDatasetOwnership(params.id, session.sub);
    await prisma.dataset.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
    }
    console.error("Dataset delete error:", err);
    return NextResponse.json({ error: "Failed to delete dataset." }, { status: 500 });
  }
}
