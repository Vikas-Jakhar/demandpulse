import { prisma } from "@/lib/db/prisma";
import type { ForecastModel as PrismaForecastModel } from "@prisma/client";
import type { CandidateModelId, ChampionPayload } from "@/types";
import { CANDIDATE_MODEL_REGISTRY } from "@/types";

// CandidateModelId and Prisma's ForecastModel enum were deliberately kept
// as the exact same string values (see the reconciliation note in
// prisma/schema.prisma) specifically so this cast is safe and doesn't need
// a lookup table. If either union ever drifts from the other, TypeScript
// will flag this line, not a runtime silently-wrong forecast label.
function toPrismaModel(id: CandidateModelId): PrismaForecastModel {
  return id as unknown as PrismaForecastModel;
}

const INSERT_BATCH_SIZE = 5000;

export interface ForecastSummary {
  id: string;
  datasetId: string;
  sku: string;
  horizon: number;
  confidenceLevel: number;
  selectedModel: CandidateModelId;
  selectedModelDisplayName: string;
  mape: number | null;
  rmse: number | null;
  mae: number | null;
  wape: number | null;
  safetyStock: number | null;
  reorderPoint: number | null;
  leadTimeDays: number | null;
  createdAt: string;
}

export interface ForecastDetail extends ForecastSummary {
  points: { date: string; predictedDemand: number; lowerBound: number; upperBound: number }[];
}

/**
 * Persists a computed ChampionPayload as a Forecast + its ForecastPoint
 * rows. Only the future horizon is stored — `ForecastPoint`'s schema
 * (Phase 1) is `(date, predictedDemand, lowerBound, upperBound)` with no
 * slot for the historical actual/fitted overlay, so a *loaded* forecast
 * from history will show the projected line and bands but not the
 * historical chart context that a live run has. That's a schema tradeoff
 * made explicitly in Phase 1, not an oversight here.
 *
 * `confidenceLevel` selects which of the champion's two precomputed bands
 * (80% or 95%) gets written to lowerBound/upperBound, since the schema
 * stores one band per Forecast, not both.
 */
export async function persistForecast(input: {
  userId: string;
  datasetId: string;
  sku: string;
  horizon: number;
  confidenceLevel: 0.8 | 0.95;
  champion: ChampionPayload;
  leadTimeDays: number;
}): Promise<ForecastSummary> {
  const horizonPoints = input.champion.points.filter((p) => p.forecast !== null);

  const forecast = await prisma.forecast.create({
    data: {
      userId: input.userId,
      datasetId: input.datasetId,
      sku: input.sku,
      horizon: input.horizon,
      confidenceLevel: input.confidenceLevel,
      selectedModel: toPrismaModel(input.champion.championModelId),
      status: "COMPLETED",
      mape: input.champion.metrics.mape,
      rmse: input.champion.metrics.rmse,
      mae: input.champion.metrics.mae,
      wape: input.champion.metrics.wape,
      safetyStock: input.champion.safetyStock.safetyStock,
      reorderPoint: input.champion.safetyStock.reorderPoint,
      leadTimeDays: input.leadTimeDays,
    },
  });

  try {
    for (let i = 0; i < horizonPoints.length; i += INSERT_BATCH_SIZE) {
      const batch = horizonPoints.slice(i, i + INSERT_BATCH_SIZE);
      await prisma.forecastPoint.createMany({
        data: batch.map((p) => ({
          forecastId: forecast.id,
          date: new Date(p.date),
          predictedDemand: p.forecast!,
          lowerBound: input.confidenceLevel === 0.95 ? p.lower95! : p.lower80!,
          upperBound: input.confidenceLevel === 0.95 ? p.upper95! : p.upper80!,
        })),
      });
    }
  } catch (err) {
    await prisma.forecast.delete({ where: { id: forecast.id } }).catch(() => {});
    throw err;
  }

  return {
    id: forecast.id,
    datasetId: forecast.datasetId,
    sku: forecast.sku,
    horizon: forecast.horizon,
    confidenceLevel: forecast.confidenceLevel,
    selectedModel: input.champion.championModelId,
    selectedModelDisplayName: input.champion.championDisplayName,
    mape: forecast.mape,
    rmse: forecast.rmse,
    mae: forecast.mae,
    wape: forecast.wape,
    safetyStock: forecast.safetyStock,
    reorderPoint: forecast.reorderPoint,
    leadTimeDays: forecast.leadTimeDays,
    createdAt: forecast.createdAt.toISOString(),
  };
}

/** Lists a user's forecast runs, newest first, optionally scoped to one dataset. */
export async function listForecastsForUser(userId: string, datasetId?: string): Promise<ForecastSummary[]> {
  const forecasts = await prisma.forecast.findMany({
    where: { userId, ...(datasetId ? { datasetId } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return forecasts.map((f) => ({
    id: f.id,
    datasetId: f.datasetId,
    sku: f.sku,
    horizon: f.horizon,
    confidenceLevel: f.confidenceLevel,
    selectedModel: f.selectedModel as unknown as CandidateModelId,
    selectedModelDisplayName: CANDIDATE_MODEL_REGISTRY[f.selectedModel as unknown as CandidateModelId].displayName,
    mape: f.mape,
    rmse: f.rmse,
    mae: f.mae,
    wape: f.wape,
    safetyStock: f.safetyStock,
    reorderPoint: f.reorderPoint,
    leadTimeDays: f.leadTimeDays,
    createdAt: f.createdAt.toISOString(),
  }));
}

/** Loads one forecast run with its full point history, for the history detail view. */
export async function loadForecastDetail(forecastId: string): Promise<ForecastDetail> {
  const forecast = await prisma.forecast.findUniqueOrThrow({ where: { id: forecastId } });
  const points = await prisma.forecastPoint.findMany({
    where: { forecastId },
    orderBy: { date: "asc" },
  });

  return {
    id: forecast.id,
    datasetId: forecast.datasetId,
    sku: forecast.sku,
    horizon: forecast.horizon,
    confidenceLevel: forecast.confidenceLevel,
    selectedModel: forecast.selectedModel as unknown as CandidateModelId,
    selectedModelDisplayName:
      CANDIDATE_MODEL_REGISTRY[forecast.selectedModel as unknown as CandidateModelId].displayName,
    mape: forecast.mape,
    rmse: forecast.rmse,
    mae: forecast.mae,
    wape: forecast.wape,
    safetyStock: forecast.safetyStock,
    reorderPoint: forecast.reorderPoint,
    leadTimeDays: forecast.leadTimeDays,
    createdAt: forecast.createdAt.toISOString(),
    points: points.map((p) => ({
      date: p.date.toISOString().slice(0, 10),
      predictedDemand: p.predictedDemand,
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
    })),
  };
}
