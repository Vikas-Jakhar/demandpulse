"use client";

import React from "react";
import { Star, Quote, Building2, CheckCircle2 } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      quote:
        "The Champion Model approach completely eliminated the weekly finger-pointing between our purchasing managers and data science teams. We cut holding stock by 24% in the first quarter without a single stockout on tier-1 SKUs.",
      author: "Marcus Vance",
      role: "VP of Global Supply Chain",
      company: "Nordic Dynamics",
      stats: "24% Inventory Reduction",
    },
    {
      quote:
        "DemandPulse's Copilot is the first AI tool that doesn't make things up. It directly cites the underlying seasonality lag and backtest WAPE score. Our executive board trusts these forecasts because they are auditable.",
      author: "Elena Rostova",
      role: "Director of Inventory Planning",
      company: "Apex Consumer Brands",
      stats: "99.1% On-Time Fulfillment",
    },
    {
      quote:
        "We went from spending 14 hours every Monday aggregating messy Excel files to literally 30 seconds. We drag the weekly shipment sheet into DemandPulse, the champion model updates, and our replenishment orders are generated.",
      author: "David Chen",
      role: "Head of Operations & Logistics",
      company: "Symphony Hardware",
      stats: "14 hrs/week Saved",
    },
  ];

  return (
    <section className="relative py-24 bg-canvas border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-signal font-mono font-medium mb-4">
            <Building2 className="h-3.5 w-3.5" />
            <span>OPERATIONAL TRUST</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Trusted by Modern Inventory Planners & Operators
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted">
            See how enterprise supply chains replace slow spreadsheets and speculative forecasts with
            rigorous statistical execution.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-xl bg-surface p-6 border border-border shadow-panel hover:border-signal/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-signal mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-signal text-signal" />
                  ))}
                </div>

                <p className="text-xs text-ink leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-ink">{rev.author}</h4>
                    <p className="text-[11px] text-ink-muted">{rev.role}</p>
                    <p className="text-[10px] text-ink-faint font-mono">{rev.company}</p>
                  </div>
                  <span className="text-[10px] font-mono text-good bg-good/10 border border-good/20 px-2 py-0.5 rounded">
                    {rev.stats}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
