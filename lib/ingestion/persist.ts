import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CleaningReport,
  ColumnMapping,
  DateFrequency,
  Dataset,
  TimeSeriesPoint,
} from "@/types";

/**
 * What gets stored in Dataset.detectedColumns — the schema (Phase 1) only
 * has one JSON column for ingestion metadata, so the column mapping, the
 * cleaning report, and the resampled frequency all live together in it.
 */
interface DetectedColumnsBlob {
  columnMapping: ColumnMapping;
  cleaningReport: CleaningReport;
  frequency: DateFrequency;
}

export interface DatasetSummary {
  id: string;
  name: string;
  fileName: string;
  rowCount: number;
  frequency: DateFrequency;
  seriesKeys: string[];
  createdAt: string;
}

// Postgres has a hard limit of 65,535 bound parameters per statement.
// DatasetRow has 4 columns (id is auto-generated, so 3 bound params:
// datasetId/date/sku/demand → 4 actually, since datasetId is bound too),
// so batches of 5,000 rows (20,000 params) stay comfortably under that with
// headroom for Prisma's own overhead, while keeping each round trip small
// enough not to time out on a slow connection.
const INSERT_BATCH_SIZE = 5000;

/**
 * Persists a cleaned client-side series to Postgres: one Dataset row plus
 * its DatasetRow children, inserted in batches. Note this stores the
 * *cleaned* series (post imputation/outlier-handling/resampling) — the
 * per-row isImputed/isOutlier flags from the client pipeline are NOT
 * persisted, because DatasetRow's schema (Phase 1) only has
 * (date, sku, demand). The aggregate counts survive in the cleaningReport
 * JSON; per-row provenance does not. If that granularity matters later,
 * it's an additive schema change (two nullable Boolean columns), not a
 * breaking one.
 */
export async function persistDataset(input: {
  userId: string;
  name: string;
  fileName: string;
  columnMapping: ColumnMapping;
  cleaningReport: CleaningReport;
  frequency: DateFrequency;
  series: TimeSeriesPoint[];
}): Promise<DatasetSummary> {
  const detectedColumns: DetectedColumnsBlob = {
    columnMapping: input.columnMapping,
    cleaningReport: input.cleaningReport,
    frequency: input.frequency,
  };

  const dataset = await prisma.dataset.create({
    data: {
      userId: input.userId,
      name: input.name,
      fileName: input.fileName,
      rowCount: input.series.length,
      detectedColumns: detectedColumns as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    for (let i = 0; i < input.series.length; i += INSERT_BATCH_SIZE) {
      const batch = input.series.slice(i, i + INSERT_BATCH_SIZE);
      await prisma.datasetRow.createMany({
        data: batch.map((p) => ({
          datasetId: dataset.id,
          date: new Date(p.date),
          sku: p.seriesKey,
          demand: p.value,
        })),
      });
    }
  } catch (err) {
    // Row insertion failed partway through — don't leave an orphaned
    // Dataset header with no (or partial) rows behind it. Best-effort
    // cleanup; if this also fails, the dataset is at least identifiable by
    // its rowCount vs. actual DatasetRow count for a manual sweep.
    await prisma.dataset.delete({ where: { id: dataset.id } }).catch(() => {});
    throw err;
  }

  const seriesKeys = [...new Set(input.series.map((p) => p.seriesKey))].sort();

  return {
    id: dataset.id,
    name: dataset.name,
    fileName: dataset.fileName,
    rowCount: dataset.rowCount,
    frequency: input.frequency,
    seriesKeys,
    createdAt: dataset.createdAt.toISOString(),
  };
}

/** Lightweight list for a "my datasets" view — no row data, just headers. */
export async function listDatasetsForUser(userId: string): Promise<DatasetSummary[]> {
  const datasets = await prisma.dataset.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // seriesKeys isn't cached on the Dataset row itself, so list view derives
  // it with one grouped query per dataset rather than loading every row.
  // Fine at list-view scale (a user's own dataset count); if that count
  // grows into the thousands this is the first place to add a cache column.
  const withSeriesKeys = await Promise.all(
    datasets.map(async (d) => {
      const distinctSkus = await prisma.datasetRow.findMany({
        where: { datasetId: d.id },
        distinct: ["sku"],
        select: { sku: true },
      });
      const blob = d.detectedColumns as unknown as DetectedColumnsBlob;
      return {
        id: d.id,
        name: d.name,
        fileName: d.fileName,
        rowCount: d.rowCount,
        frequency: blob.frequency,
        seriesKeys: distinctSkus.map((s) => s.sku).sort(),
        createdAt: d.createdAt.toISOString(),
      };
    })
  );

  return withSeriesKeys;
}

/**
 * Loads a dataset back into the exact client-side `Dataset` shape
 * (`types/index.ts`) so it can be dropped straight into the Zustand store
 * the same way a freshly-uploaded dataset is — the dashboard and
 * forecasting pipeline don't need to know whether a dataset came from a
 * fresh upload or a saved one.
 */
export async function loadDatasetForClient(datasetId: string): Promise<Dataset> {
  const dataset = await prisma.dataset.findUniqueOrThrow({ where: { id: datasetId } });
  const rows = await prisma.datasetRow.findMany({
    where: { datasetId },
    orderBy: { date: "asc" },
  });

  const blob = dataset.detectedColumns as unknown as DetectedColumnsBlob;

  const series: TimeSeriesPoint[] = rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    value: r.demand,
    seriesKey: r.sku,
  }));

  return {
    id: dataset.id,
    name: dataset.name,
    uploadedAt: dataset.createdAt.toISOString(),
    frequency: blob.frequency,
    columnMapping: blob.columnMapping,
    cleaningReport: blob.cleaningReport,
    series,
    seriesKeys: [...new Set(series.map((p) => p.seriesKey))].sort(),
  };
}
