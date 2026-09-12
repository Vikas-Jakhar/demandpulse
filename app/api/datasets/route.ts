import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { persistDataset, listDatasetsForUser } from "@/lib/ingestion/persist";

const columnMappingSchema = z.object({
  dateColumn: z.string().nullable(),
  targetColumn: z.string().nullable(),
  seriesKeyColumn: z.string().nullable(),
  regressorColumns: z.array(z.string()),
});

const cleaningReportSchema = z.object({
  totalRows: z.number().int().nonnegative(),
  nullsImputed: z.number().int().nonnegative(),
  outliersFlagged: z.number().int().nonnegative(),
  outliersCapped: z.number().int().nonnegative(),
  outliersExcluded: z.number().int().nonnegative(),
  resampledFrom: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).nullable(),
  resampledTo: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
});

const seriesPointSchema = z.object({
  date: z.string().min(1),
  value: z.number(),
  seriesKey: z.string().min(1),
});

const createDatasetSchema = z.object({
  name: z.string().trim().min(1).max(200),
  fileName: z.string().trim().min(1).max(260),
  columnMapping: columnMappingSchema,
  cleaningReport: cleaningReportSchema,
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  // Capped well above what any real upload needs (50MB / typical row width
  // parses out to well under 1M rows) — this is a sanity ceiling against a
  // malformed or malicious payload, not an expected-usage limit.
  series: z.array(seriesPointSchema).min(1).max(1_000_000),
});

/**
 * POST /api/datasets — persists a parsed-and-cleaned upload to Postgres.
 *
 * Known scaling caveat: the client sends the full cleaned series as one
 * JSON body. next.config.js's `serverActions.bodySizeLimit` does NOT apply
 * here — that setting is Server-Actions-only. App Router Route Handlers
 * have no first-party body-size config; the effective limit is whatever
 * your hosting platform enforces (e.g. historically ~4.5MB on Vercel's
 * serverless functions). A file that parses down to a large cleaned series
 * (dense daily data across many SKUs) can exceed that before it exceeds the
 * 50MB *file* limit enforced in lib/ingestion/parser.ts. If that turns out
 * to matter in practice, the fix is chunked/streamed upload (send
 * DatasetRow batches across multiple requests) rather than raising a limit
 * that may not be configurable on your platform at all.
 *
 * Guest sessions are rejected here rather than silently no-oped: a guest's
 * session `id` isn't backed by a real `User` row (see the comment in
 * app/api/auth/guest/route.ts), so `Dataset.userId` would violate the
 * foreign-key constraint if we tried. Guests get sample/demo data in the UI
 * and can preview their own upload client-side, but persisting it requires
 * a real account — the client shows this as a prompt to sign up, not a
 * generic error.
 */
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  if (session.isGuest) {
    return NextResponse.json(
      { error: "Guest sessions can't save datasets. Create a free account to persist your data." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof createDatasetSchema>;
  try {
    body = createDatasetSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid dataset payload.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  try {
    const summary = await persistDataset({
      userId: session.sub,
      name: body.name,
      fileName: body.fileName,
      columnMapping: body.columnMapping,
      cleaningReport: body.cleaningReport,
      frequency: body.frequency,
      series: body.series,
    });
    return NextResponse.json({ dataset: summary }, { status: 201 });
  } catch (err) {
    console.error("Dataset persistence error:", err);
    return NextResponse.json({ error: "Failed to save dataset." }, { status: 500 });
  }
}

/** GET /api/datasets — lists the current user's saved datasets, newest first. */
export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  if (session.isGuest) {
    return NextResponse.json({ datasets: [] });
  }

  try {
    const datasets = await listDatasetsForUser(session.sub);
    return NextResponse.json({ datasets });
  } catch (err) {
    console.error("Dataset list error:", err);
    return NextResponse.json({ error: "Failed to load datasets." }, { status: 500 });
  }
}
