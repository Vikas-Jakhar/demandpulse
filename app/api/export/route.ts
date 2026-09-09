import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentSession } from "@/lib/auth/session";
import type { ForecastPoint } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { points, format, seriesKey } = (await req.json()) as {
    points: ForecastPoint[];
    format: "csv" | "xlsx";
    seriesKey: string;
  };

  if (!points?.length) {
    return NextResponse.json({ error: "No forecast points to export." }, { status: 400 });
  }

  const rows = points.map((p) => ({
    date: p.date,
    actual: p.actual ?? "",
    fitted: p.fitted ?? "",
    forecast: p.forecast ?? "",
    lower_80: p.lower80 ?? "",
    upper_80: p.upper80 ?? "",
    lower_95: p.lower95 ?? "",
    upper_95: p.upper95 ?? "",
  }));

  const fileBase = `demandpulse_forecast_${seriesKey}_${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Forecast");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
    },
  });
}
