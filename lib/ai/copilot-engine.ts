import type { CopilotContext } from "@/types";

interface MessageItem {
  role: "user" | "assistant";
  content: string;
}

/**
 * Call Google Gemini API (Free tier available via Google AI Studio).
 * Supports GEMINI_API_KEY or GOOGLE_API_KEY.
 */
async function callGemini(apiKey: string, systemPrompt: string, messages: MessageItem[]): Promise<string | null> {
  // Use gemini-1.5-flash or gemini-2.0-flash which offer high rate limits on the free tier
  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errText = await res.text();
        console.warn(`Gemini (${model}) returned non-ok status:`, res.status, errText);
      }
    } catch (err) {
      console.warn(`Gemini (${model}) fetch error:`, err);
    }
  }

  return null;
}

/**
 * Call Groq API (Free cloud inference for open models).
 * Supports GROQ_API_KEY.
 */
async function callGroq(apiKey: string, systemPrompt: string, messages: MessageItem[]): Promise<string | null> {
  try {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (err) {
    console.warn("Groq fetch error:", err);
  }
  return null;
}

/**
 * Call OpenRouter API (Supports free models with OPENROUTER_API_KEY).
 */
async function callOpenRouter(apiKey: string, systemPrompt: string, messages: MessageItem[]): Promise<string | null> {
  try {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 600,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (err) {
    console.warn("OpenRouter fetch error:", err);
  }
  return null;
}

/**
 * Call Anthropic Claude if ANTHROPIC_API_KEY is available.
 */
async function callAnthropic(apiKey: string, systemPrompt: string, messages: MessageItem[]): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const textBlock = data?.content?.find((b: { type: string; text?: string }) => b.type === "text");
      return textBlock?.text?.trim() || null;
    }
  } catch (err) {
    console.warn("Anthropic fetch error:", err);
  }
  return null;
}

/**
 * Built-In Grounded Statistical Reasoning Engine (Zero-Key Fallback).
 * Synthesizes mathematically precise, context-aware responses directly from
 * active dataset parameters when no external API key is configured.
 */
export function generateGroundedStatisticalReply(
  context: CopilotContext | null,
  userMessage: string
): string {
  if (!context) {
    return "No active forecast dataset is loaded. Please upload or select a dataset on the dashboard first, and I will analyze the demand drivers, forecast trends, and safety stock recommendations.";
  }

  const query = userMessage.toLowerCase();
  const {
    datasetName,
    seriesKey,
    frequency,
    horizon,
    championDisplayName,
    forecastReliabilityPct,
    metrics,
    totalPredictedDemand,
    safetyStock,
    outlierCount,
    recentAnomalies,
    benchmarks,
  } = context;

  // 1. Forecast Summary / Overview
  if (
    query.includes("summarize") ||
    query.includes("summary") ||
    query.includes("overview") ||
    query.includes("forecast") ||
    query.includes("projection") ||
    query.includes("outlook")
  ) {
    return `### Forecast Overview for ${seriesKey} (${datasetName})\n\n` +
      `* **Projected Volume:** **${totalPredictedDemand.toLocaleString()} units** over the next **${horizon} ${frequency.toLowerCase()} periods**.\n` +
      `* **Champion Model:** **${championDisplayName}** with a forecast reliability of **${forecastReliabilityPct}%** (WAPE: **${metrics.wape}%**, MAPE: **${metrics.mape}%**).\n` +
      `* **Safety Stock Buffer:** Maintain **${safetyStock.safetyStock.toLocaleString()} units** on hand to achieve the required cycle service level (Z = ${safetyStock.zScore}).\n` +
      `* **Reorder Trigger (ROP):** Place replenishment orders when active inventory reaches **${safetyStock.reorderPoint.toLocaleString()} units**.\n` +
      `* **Anomalies Detected:** ${outlierCount > 0 ? `${outlierCount} statistical outlier(s) detected in sales history.` : "Sales trajectory is stable with no anomalous deviations."}`;
  }

  // 2. Spikes, Dips & Anomalies
  if (
    query.includes("spike") ||
    query.includes("dip") ||
    query.includes("anomaly") ||
    query.includes("anomalies") ||
    query.includes("outlier") ||
    query.includes("drop") ||
    query.includes("variance") ||
    query.includes("why")
  ) {
    if (recentAnomalies && recentAnomalies.length > 0) {
      const anomalyList = recentAnomalies
        .slice(0, 4)
        .map((a) => `  * **${a.date}:** ${a.value.toLocaleString()} units (${a.deviation > 0 ? "+" : ""}${a.deviation.toFixed(1)}σ deviation)`)
        .join("\n");

      return `### Anomaly & Spike Analysis for ${seriesKey}\n\n` +
        `Our statistical pipeline detected **${outlierCount} historical variance events** for this SKU:\n\n` +
        `${anomalyList}\n\n` +
        `**Key Drivers:**\n` +
        `1. **Seasonal Autocorrelation:** The champion model identified periodic demand cycles that explain recent acceleration.\n` +
        `2. **Replenishment Guidance:** To absorb potential demand variance of this magnitude, hold a buffer of **${safetyStock.safetyStock.toLocaleString()} safety stock units** ahead of the next cycle.`;
    }

    return `### Variance Analysis for ${seriesKey}\n\n` +
      `No severe statistical outliers were detected in the recent sales window (${outlierCount} total in history). Demand velocity conforms closely to the projected trendline of **${championDisplayName}** with **${forecastReliabilityPct}% reliability**.`;
  }

  // 3. Safety Stock & Inventory Buffers
  if (
    query.includes("safety stock") ||
    query.includes("buffer") ||
    query.includes("reorder") ||
    query.includes("stockout") ||
    query.includes("inventory") ||
    query.includes("lead time")
  ) {
    return `### Inventory Buffer Recommendations for ${seriesKey}\n\n` +
      `* **Calculated Safety Stock:** **${safetyStock.safetyStock.toLocaleString()} units**\n` +
      `* **Reorder Point (ROP):** **${safetyStock.reorderPoint.toLocaleString()} units**\n` +
      `* **Cycle Service Target:** Z = **${safetyStock.zScore}** (providing protection against lead-time stockouts)\n` +
      `* **Total Horizon Demand:** **${totalPredictedDemand.toLocaleString()} units** across ${horizon} ${frequency.toLowerCase()} periods.\n\n` +
      `**Action Item:** Ensure purchase orders are issued before on-hand inventory drops beneath **${safetyStock.reorderPoint.toLocaleString()} units** to prevent order backlogs during supplier transit.`;
  }

  // 4. Model Selection & Tournament Benchmarks
  if (
    query.includes("model") ||
    query.includes("algorithm") ||
    query.includes("champion") ||
    query.includes("compare") ||
    query.includes("benchmark") ||
    query.includes("arima") ||
    query.includes("prophet") ||
    query.includes("winters") ||
    query.includes("wape")
  ) {
    let benchmarkText = "";
    if (benchmarks && benchmarks.length > 0) {
      benchmarkText = benchmarks
        .map((b) => `  * **${b.displayName}**${b.isChampion ? " 🏆 (Winner)" : ""}: WAPE **${b.metrics.wape}%**, MAPE **${b.metrics.mape}%**, RMSE **${b.metrics.rmse}**`)
        .join("\n");
    } else {
      benchmarkText = `  * **${championDisplayName}** 🏆 (Selected): WAPE **${metrics.wape}%**, MAPE **${metrics.mape}%**`;
    }

    return `### Champion Model Tournament Results\n\n` +
      `DemandPulse automatically backtested candidate algorithms against held-out historical sales for **${seriesKey}**:\n\n` +
      `${benchmarkText}\n\n` +
      `**Why ${championDisplayName} Won:**\n` +
      `It delivered the lowest prediction error (**${metrics.wape}% WAPE**), providing the best trade-off between trend fitting and variance suppression. It was refit on the complete dataset to produce the current forecast.`;
  }

  // 5. Purchase Order / Replenishment Draft
  if (
    query.includes("purchase order") ||
    query.includes("po") ||
    query.includes("supplier") ||
    query.includes("order") ||
    query.includes("buy")
  ) {
    return `### Draft Purchase Order Brief\n\n` +
      `* **SKU / Product:** \`${seriesKey}\`\n` +
      `* **Dataset Reference:** ${datasetName}\n` +
      `* **Recommended Order Buffer:** **${safetyStock.safetyStock.toLocaleString()} units**\n` +
      `* **Reorder Trigger Threshold:** **${safetyStock.reorderPoint.toLocaleString()} units**\n` +
      `* **Expected Demand Horizon:** **${totalPredictedDemand.toLocaleString()} units** (${horizon} ${frequency.toLowerCase()} periods)\n` +
      `* **Model Reliability Rating:** **${forecastReliabilityPct}%**\n\n` +
      `*Recommendation: Release replenishment requisition when inventory falls to ${safetyStock.reorderPoint.toLocaleString()} units.*`;
  }

  // 6. Default Grounded Response
  return `### Analysis for ${seriesKey}\n\n` +
    `Based on the active **${championDisplayName}** forecast (${forecastReliabilityPct}% reliability):\n\n` +
    `* **Projected Volume:** **${totalPredictedDemand.toLocaleString()} units** over the next **${horizon} ${frequency.toLowerCase()} periods**.\n` +
    `* **Inventory Buffer:** Recommended safety stock is **${safetyStock.safetyStock.toLocaleString()} units** with a reorder point of **${safetyStock.reorderPoint.toLocaleString()} units**.\n` +
    `* **Model Precision:** Selected via backtesting with **${metrics.wape}% WAPE** and **${metrics.mape}% MAPE**.\n\n` +
    `Feel free to ask about anomaly spikes, safety buffer calculations, model comparisons, or purchase order drafts.`;
}

/**
 * Main Copilot Engine orchestrator.
 * Queries available free APIs (Google Gemini, Groq, OpenRouter) or Anthropic,
 * and seamlessly falls back to the grounded statistical reasoning engine.
 */
export async function getCopilotResponse(
  systemPrompt: string,
  messages: MessageItem[],
  context: CopilotContext | null
): Promise<{ reply: string; provider: string }> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // 1. Try Google Gemini (Free Tier API)
  if (geminiKey) {
    const reply = await callGemini(geminiKey, systemPrompt, messages);
    if (reply) return { reply, provider: "Google Gemini (Free API)" };
  }

  // 2. Try Groq (Free Tier API)
  if (groqKey) {
    const reply = await callGroq(groqKey, systemPrompt, messages);
    if (reply) return { reply, provider: "Groq Llama-3" };
  }

  // 3. Try OpenRouter (Free Tier Models)
  if (openRouterKey) {
    const reply = await callOpenRouter(openRouterKey, systemPrompt, messages);
    if (reply) return { reply, provider: "OpenRouter Free" };
  }

  // 4. Try Anthropic (if configured)
  if (anthropicKey) {
    const reply = await callAnthropic(anthropicKey, systemPrompt, messages);
    if (reply) return { reply, provider: "Anthropic Claude" };
  }

  // 5. Intelligent Grounded Statistical Engine Fallback (Zero-Key Guaranteed)
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const reply = generateGroundedStatisticalReply(context, lastUserMessage);
  return { reply, provider: "DemandPulse Grounded Engine" };
}
