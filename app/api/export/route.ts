import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import type { ForecastPoint, SafetyStockResult } from "@/types";

const exportRequestSchema = z.object({
  points: z
    .array(
      z.object({
        date: z.string(),
        actual: z.number().nullable(),
        fitted: z.number().nullable(),
        forecast: z.number().nullable(),
        lower80: z.number().nullable(),
        upper80: z.number().nullable(),
        lower95: z.number().nullable(),
        upper95: z.number().nullable(),
      })
    )
    .min(1, "No forecast points to export."),
  format: z.enum(["csv", "xlsx", "pdf"]),
  seriesKey: z.string(),
  // Optional report chrome for the PDF — CSV/XLSX ignore these.
  championDisplayName: z.string().optional(),
  forecastReliabilityPct: z.number().optional(),
  safetyStock: z
    .object({ zScore: z.number(), safetyStock: z.number(), reorderPoint: z.number() })
    .optional(),
});

function toRows(points: ForecastPoint[]) {
  return points.map((p) => ({
    date: p.date,
    actual: p.actual ?? "",
    fitted: p.fitted ?? "",
    forecast: p.forecast ?? "",
    lower_80: p.lower80 ?? "",
    upper_80: p.upper80 ?? "",
    lower_95: p.lower95 ?? "",
    upper_95: p.upper95 ?? "",
  }));
}

/**
 * Builds a one-page-plus-table PDF summary: report header, the KPI figures
 * a planner would screenshot for a meeting, then a plain data table of the
 * forecast horizon. Deliberately not a pixel copy of the dashboard's
 * Recharts visual — pdfkit draws its own primitives, not React components —
 * but every number on the page is the same number the dashboard shows.
 */
async function buildPdfReport(params: {
  seriesKey: string;
  points: ForecastPoint[];
  championDisplayName?: string;
  forecastReliabilityPct?: number;
  safetyStock?: SafetyStockResult;
}): Promise<Buffer> {
  const { seriesKey, points, championDisplayName, forecastReliabilityPct, safetyStock } = params;
  const horizonPoints = points.filter((p) => p.forecast !== null);
  const totalPredicted = horizonPoints.reduce((sum, p) => sum + (p.forecast ?? 0), 0);

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // ── Header ──
  doc.fontSize(18).fillColor("#0C0F13").text("DemandPulse Forecast Report", { continued: false });
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor("#5B6472").text(`${seriesKey} · Generated ${new Date().toLocaleString()}`);
  if (championDisplayName) {
    doc.moveDown(0.1);
    doc
      .fontSize(10)
      .fillColor("#5B6472")
      .text(
        `Model: ${championDisplayName}` +
          (forecastReliabilityPct != null ? ` · Backtested reliability: ${forecastReliabilityPct}%` : "")
      );
  }
  doc.moveDown(1);

  // ── KPI summary ──
  doc.fontSize(12).fillColor("#0C0F13").text("Summary");
  doc.moveDown(0.3);
  const kpiLines = [
    `Total predicted demand over horizon: ${Math.round(totalPredicted).toLocaleString()}`,
    ...(safetyStock
      ? [
          `Recommended safety stock: ${Math.round(safetyStock.safetyStock).toLocaleString()} units`,
          `Reorder point: ${Math.round(safetyStock.reorderPoint).toLocaleString()} units`,
        ]
      : []),
  ];
  doc.fontSize(10).fillColor("#1B212A");
  kpiLines.forEach((line) => doc.text(`• ${line}`));
  doc.moveDown(1);

  // ── Forecast table ──
  doc.fontSize(12).fillColor("#0C0F13").text("Forecast detail");
  doc.moveDown(0.4);

  const colX = { date: 48, predicted: 180, lower: 310, upper: 430 };
  const rowHeight = 16;
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  function drawTableHeader() {
    doc.fontSize(9).fillColor("#5B6472");
    doc.text("Date", colX.date, doc.y, { continued: false });
    doc.text("Predicted", colX.predicted, doc.y - doc.currentLineHeight());
    doc.text("Lower bound", colX.lower, doc.y - doc.currentLineHeight());
    doc.text("Upper bound", colX.upper, doc.y - doc.currentLineHeight());
    doc.moveDown(0.3);
    doc
      .moveTo(48, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#E8EAED")
      .stroke();
    doc.moveDown(0.2);
  }

  drawTableHeader();

  // Cap the table at a sane number of rows so a 365-day horizon doesn't
  // produce a multi-hundred-page PDF — long horizons get a note instead of
  // every row. CSV/XLSX export remain the right tool for the full series.
  const MAX_TABLE_ROWS = 120;
  const rowsToRender = horizonPoints.slice(0, MAX_TABLE_ROWS);

  doc.fontSize(9).fillColor("#1B212A");
  for (const p of rowsToRender) {
    if (doc.y + rowHeight > pageBottom) {
      doc.addPage();
      drawTableHeader();
      doc.fontSize(9).fillColor("#1B212A");
    }
    const y = doc.y;
    doc.text(p.date, colX.date, y);
    doc.text(p.forecast != null ? Math.round(p.forecast).toLocaleString() : "—", colX.predicted, y);
    doc.text(p.lower95 != null ? Math.round(p.lower95).toLocaleString() : "—", colX.lower, y);
    doc.text(p.upper95 != null ? Math.round(p.upper95).toLocaleString() : "—", colX.upper, y);
    doc.moveDown(0.75);
  }

  if (horizonPoints.length > MAX_TABLE_ROWS) {
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor("#5B6472")
      .text(
        `Showing the first ${MAX_TABLE_ROWS} of ${horizonPoints.length} forecast periods. Export as CSV or Excel for the complete series.`
      );
  }

  doc.end();
  return done;
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  let body: z.infer<typeof exportRequestSchema>;
  try {
    body = exportRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid export request." }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const fileBase = `demandpulse_forecast_${body.seriesKey}_${new Date().toISOString().slice(0, 10)}`;

  if (body.format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(toRows(body.points as ForecastPoint[]));
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }

  if (body.format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(toRows(body.points as ForecastPoint[]));
    XLSX.utils.book_append_sheet(workbook, worksheet, "Forecast");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
      },
    });
  }

  try {
    const pdfBuffer = await buildPdfReport({
      seriesKey: body.seriesKey,
      points: body.points as ForecastPoint[],
      championDisplayName: body.championDisplayName,
      forecastReliabilityPct: body.forecastReliabilityPct,
      safetyStock: body.safetyStock as SafetyStockResult | undefined,
    });
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
     },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json({ error: "Failed to generate PDF report." }, { status: 500 });
  }
}
