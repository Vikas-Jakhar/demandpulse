"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: "What is the Champion Model paradigm and why does it matter?",
      a: "Instead of picking an arbitrary forecasting formula or showing users 5 confusing conflicting lines on one graph, DemandPulse automatically backtests four distinct statistical candidates (Auto-ARIMA, Holt-Winters Exponential Smoothing, Prophet-style Trend/Seasonality, and Weighted Moving Average) on a held-out validation segment. The model achieving the lowest Weighted Absolute Percentage Error (WAPE) is crowned the Champion, refit on the complete dataset, and rendered as the authoritative forecast line.",
    },
    {
      q: "Can I test DemandPulse without setting up a database or account?",
      a: "Yes! DemandPulse includes an instant 'Guest Mode' (available via the 'Try Instant Demo' button in the navigation bar and hero). In guest mode, a secure cryptographic session token is issued directly in-memory, enabling you to explore pre-loaded enterprise datasets, interact with forecasting charts, adjust safety stocks, and run scenario sliders immediately without a database.",
    },
    {
      q: "How does DemandPulse calculate Safety Stock and Reorder Points?",
      a: "DemandPulse implements standard industrial supply-chain formulas: Safety Stock = Z * sqrt(LeadTime) * StdDev(DailyDemand), where Z corresponds to your target cycle service level (e.g. Z=1.645 for 95%, Z=2.054 for 98%). The Reorder Point (ROP) is calculated as Expected Lead Time Demand plus the dynamic Safety Stock buffer. When inventory drops below this threshold, replenishment orders should be triggered.",
    },
    {
      q: "What data formats are supported for sales history ingestion?",
      a: "You can drag and drop standard CSV and Excel (.xlsx) files. DemandPulse's smart schema detector automatically identifies date columns (weekly, monthly, or daily), SKU/item identifiers, and units sold. It automatically checks for gaps in time-series sequences and normalizes them for statistical modeling.",
    },
    {
      q: "How is the AI Copilot grounded in my data?",
      a: "Unlike generic chat assistants that hallucinate answers, the DemandPulse Copilot has real-time runtime access to the active dataset summary, candidate model tournament metrics, seasonal autocorrelation lags, and calculated safety stocks. When you ask why a spike occurred or what buffer to order, it reasons using the exact mathematical parameters computed by the engine.",
    },
    {
      q: "Can DemandPulse be self-hosted in our own private cloud?",
      a: "Absolutely. DemandPulse is built on Next.js 14, Tailwind CSS, TypeScript, and Prisma ORM. It includes a ready-to-deploy Dockerfile and docker-compose.yml configuration that connects to any PostgreSQL database (AWS RDS, Google Cloud SQL, Supabase, or on-premise hardware).",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-[#151518] border-t border-[#26262E]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#0B0B0D] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
            Everything you need to know about DemandPulse's forecasting engine, data privacy, and
            deployment.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#26262E] bg-[#0B0B0D] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[#FF6A00] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#FF6A00] shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#94A3B8] shrink-0 ml-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#E2E8F0] leading-relaxed border-t border-[#1E1E26] pt-3.5 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
