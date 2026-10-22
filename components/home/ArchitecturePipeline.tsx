"use client";

import React from "react";
import {
  FileText,
  Cpu,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export function ArchitecturePipeline() {
  const steps = [
    {
      num: "01",
      title: "Ingestion & Normalization",
      subtitle: "Schema detection & gap healing",
      desc: "Raw CSV/XLSX uploads are analyzed for date formatting, SKU identifiers, and sales quantities. Irregular sales events are resampled into continuous weekly or monthly buckets.",
      icon: FileText,
    },
    {
      num: "02",
      title: "Validation Split & Tournament",
      subtitle: "Out-of-sample backtesting",
      desc: "The engine holds out a validation horizon (e.g. recent 8 weeks). Four candidate algorithms (Auto-ARIMA, Holt-Winters, Prophet, Moving Avg) fit on the train set and predict the held-out window.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "Champion Crown & Full Refit",
      subtitle: "Ranked by minimal WAPE",
      desc: "The algorithm with the lowest Weighted Absolute Percentage Error (WAPE) is chosen as champion. It is instantly refit onto the 100% full dataset to project forward.",
      icon: Trophy,
    },
    {
      num: "04",
      title: "Grounded AI Copilot",
      subtitle: "Grounded root-cause synthesis",
      desc: "Dynamic confidence bands (80%/95%) and safety stock buffers are calculated. The AI Copilot ingests the active parameters to explain anomalies and draft purchase orders.",
      icon: Sparkles,
    },
  ];

  return (
    <section id="architecture" className="relative py-24 bg-[#0B0B0D] border-t border-[#26262E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#151518] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <Cpu className="h-3.5 w-3.5" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How the Champion Architecture Outperforms Single-Model Black Boxes
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
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
                className="relative rounded-xl bg-[#151518] p-6 border border-[#26262E] hover:border-[#FF6A00]/50 hover:shadow-[0_0_20px_rgba(255,106,0,0.15)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E]">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-lg bg-[#1C1C22] border border-[#26262E] text-[#FF6A00]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <div className="text-[11px] font-mono text-[#FF9D2E] mt-0.5 font-medium">
                    {step.subtitle}
                  </div>

                  <p className="mt-3 text-xs text-[#E2E8F0] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#26262E] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                  <span>Stage {step.num} verified</span>
                  <CheckCircle className="h-3.5 w-3.5 text-[#10B981]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Callout Banner */}
        <div className="mt-12 rounded-xl bg-[#151518] border border-[#26262E] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] shrink-0 border border-[#FF6A00]/30 shadow-[0_0_12px_rgba(255,106,0,0.2)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Auditable Transparency at Every Step
              </h4>
              <p className="text-xs text-[#E2E8F0] mt-0.5">
                Need to inspect why Holt-Winters lost to Auto-ARIMA? Open the Model Diagnostics drawer
                in the app to view residual scatterplots, AIC/BIC scores, and validation curves.
              </p>
            </div>
          </div>
          <a
            href="#sandbox"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B0B0D] border border-[#26262E] hover:border-[#FF6A00]/50 text-xs font-mono font-bold text-white hover:text-[#FF6A00] transition-all hover:shadow-[0_0_15px_rgba(255,106,0,0.2)]"
          >
            <span>Test the Algorithm Live</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#FF6A00]" />
          </a>
        </div>
      </div>
    </section>
  );
}
