"use client";

import React from "react";
import {
  FileText,
  Filter,
  Cpu,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export function ArchitecturePipeline() {
  const steps = [
    {
      num: "01",
      title: "Ingestion & Cadence Normalization",
      subtitle: "Schema detection & gap healing",
      desc: "Raw CSV/XLSX uploads are analyzed for date formatting, SKU identifiers, and sales quantities. Irregular sales events are resampled into continuous weekly or monthly buckets.",
      icon: FileText,
      accent: "#4FD1C5",
    },
    {
      num: "02",
      title: "Validation Split & Tournament",
      subtitle: "Out-of-sample backtesting",
      desc: "The engine holds out a validation horizon (e.g. recent 8 weeks). Four candidate algorithms (Auto-ARIMA, Holt-Winters, Prophet, Moving Avg) fit on the train set and predict the held-out window.",
      icon: Cpu,
      accent: "#F5A623",
    },
    {
      num: "03",
      title: "Champion Crown & Full Refit",
      subtitle: "Ranked by minimal WAPE",
      desc: "The algorithm with the lowest Weighted Absolute Percentage Error (WAPE) is chosen as champion. It is instantly refit onto the 100% full dataset to project forward.",
      icon: Trophy,
      accent: "#F5A623",
    },
    {
      num: "04",
      title: "Grounded AI Copilot & Replenishment",
      subtitle: "Grounded root-cause synthesis",
      desc: "Dynamic confidence bands (80%/95%) and safety stock buffers are calculated. The AI Copilot ingests the active parameters to explain anomalies and draft purchase orders.",
      icon: Sparkles,
      accent: "#3FBF7F",
    },
  ];

  return (
    <section id="architecture" className="relative py-24 bg-canvas border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-signal font-mono font-medium mb-4">
            <Cpu className="h-3.5 w-3.5" />
            <span>THE ENGINE PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            How the Champion Architecture Outperforms Single-Model Black Boxes
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted">
            Demand patterns change between product lifecycles. A seasonal winter coat requires
            different math than a steady consumable. Our multi-stage tournament guarantees the
            optimal algorithm wins every single time.
          </p>
        </div>

        {/* 4-Step Architecture Flow */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-xl bg-surface p-6 border border-border hover:border-signal/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-mono text-xl font-bold"
                      style={{ color: step.accent }}
                    >
                      {step.num}
                    </span>
                    <div
                      className="p-2 rounded-lg bg-surface-raised border border-border-soft"
                      style={{ color: step.accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                  <div className="text-[11px] font-mono text-ink-muted mt-0.5">
                    {step.subtitle}
                  </div>

                  <p className="mt-3 text-xs text-ink-faint leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-ink-muted font-mono">
                  <span>Stage {step.num} verified</span>
                  <CheckCircle className="h-3.5 w-3.5 text-good" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Callout Banner */}
        <div className="mt-12 rounded-xl bg-surface-raised border border-border p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-signal/15 text-signal shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">
                Auditable Transparency at Every Step
              </h4>
              <p className="text-xs text-ink-muted">
                Need to inspect why Holt-Winters lost to Auto-ARIMA? Open the Model Diagnostics drawer
                in the app to view residual scatterplots, AIC/BIC scores, and validation curves.
              </p>
            </div>
          </div>
          <a
            href="#sandbox"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-surface border border-border hover:border-signal text-xs font-mono text-ink hover:text-signal transition-colors"
          >
            <span>Test the Algorithm Live</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
