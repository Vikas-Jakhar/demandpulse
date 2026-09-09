import type { ChampionPayload, CopilotContext, DiagnosticsPayload } from "@/types";

/**
 * Builds the CopilotContext consumed by /api/copilot's system prompt.
 *
 * The Champion Model rule extends to the copilot: it should discuss demand
 * peaks, dips, stockout risk, and reorder windows purely in terms of the
 * selected winning model, the same way the dashboard only shows one line.
 * `benchmarks` is attached so the model CAN answer "why was this model
 * chosen?" if asked, but the system prompt (see `buildCopilotSystemPrompt`)
 * explicitly tells it not to volunteer the comparison unprompted.
 */
export function buildCopilotContext(
  champion: ChampionPayload,
  datasetName: string,
  seriesKey: string,
  frequency: CopilotContext["frequency"],
  horizon: number,
  outlierCount: number,
  recentAnomalies: CopilotContext["recentAnomalies"],
  diagnostics?: DiagnosticsPayload
): CopilotContext {
  const totalPredictedDemand = Math.round(
    champion.points.filter((p) => p.forecast !== null).reduce((sum, p) => sum + (p.forecast ?? 0), 0)
  );

  return {
    datasetName,
    seriesKey,
    frequency,
    horizon,
    championModelId: champion.championModelId,
    championDisplayName: champion.championDisplayName,
    forecastReliabilityPct: champion.forecastReliabilityPct,
    metrics: champion.metrics,
    totalPredictedDemand,
    outlierCount,
    recentAnomalies,
    safetyStock: champion.safetyStock,
    benchmarks: diagnostics?.benchmarks,
  };
}

/**
 * System prompt: grounded strictly in the champion model's figures by
 * default. Benchmark/backtest data is included in the context payload but
 * the model is instructed to keep it in reserve — surfaced only if the user
 * explicitly asks why this model was chosen, matching the "no algorithm
 * shootout on the main view" rule extending to the conversational surface.
 */
export function buildCopilotSystemPrompt(context: CopilotContext | null): string {
  if (!context) {
    return `You are DemandPulse's Forecast Copilot. No dataset is currently loaded — tell the user to upload or select a dataset before asking data-specific questions. Do not fabricate figures.`;
  }

  const anomalyLines = context.recentAnomalies
    .slice(0, 5)
    .map((a) => `- ${a.date}: value ${a.value} (${a.deviation > 0 ? "+" : ""}${a.deviation.toFixed(1)}σ from expected)`)
    .join("\n");

  const benchmarkSection = context.benchmarks
    ? `\nBACKTEST BENCHMARKS (reference ONLY if the user explicitly asks why this model was chosen, or asks to compare models — never volunteer this list otherwise):\n${context.benchmarks
        .map(
          (b) =>
            `- ${b.displayName}${b.isChampion ? " (selected)" : ""}: WAPE ${b.metrics.wape}%, MAPE ${b.metrics.mape}%, RMSE ${b.metrics.rmse}`
        )
        .join("\n")}`
    : "";

  return `You are DemandPulse's Forecast Copilot, embedded in a demand-planning dashboard that follows a "Champion Model" design: the dashboard shows exactly one recommended forecast, never a lineup of competing models.

Speak strictly in terms of the recommended forecast below. Explain demand peaks, seasonal dips, stockout risk, and supplier reorder windows using ONLY these grounded figures. If something isn't covered by this context, say you don't have that figure rather than estimating one. Do not mention alternative models, algorithm names, or benchmark comparisons unless the user explicitly asks why this model was chosen or asks to compare models — that is the one case where you may reference the benchmark section below.

RECOMMENDED FORECAST
- Dataset: ${context.datasetName}
- Active series: ${context.seriesKey}
- Frequency: ${context.frequency}
- Forecast horizon: ${context.horizon} periods
- Forecast Reliability: ${context.forecastReliabilityPct}%
- Total predicted demand over horizon: ${context.totalPredictedDemand}
- Recommended safety stock: ${context.safetyStock.safetyStock} units (reorder point ${context.safetyStock.reorderPoint} units, service-level z=${context.safetyStock.zScore})
- Outliers detected in history: ${context.outlierCount}

RECENT ANOMALIES
${anomalyLines || "None flagged in the recent window."}
${benchmarkSection}

Style: concise, business-facing language a supply-chain analyst would use. Reference specific numbers from above rather than vague language. Keep answers under ~120 words unless the user asks for detail. Never say "MAPE" or "WAPE" unprompted in a normal answer — say "forecast reliability" instead; only use the raw metric names if the user asks about model selection or benchmarks specifically.`;
}
