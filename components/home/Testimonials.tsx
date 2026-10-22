"use client";

import React from "react";
import { Star, Building2 } from "lucide-react";

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
    <section className="relative py-24 bg-[#0B0B0D] border-t border-[#26262E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#151518] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <Building2 className="h-3.5 w-3.5" />
            <span>OPERATIONAL TRUST</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Trusted by Modern Inventory Planners & Operators
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
            See how enterprise supply chains replace slow spreadsheets and speculative forecasts with
            rigorous statistical execution.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-xl bg-[#151518] p-6 border border-[#26262E] shadow-xl hover:border-[#FF6A00]/50 hover:shadow-[0_0_20px_rgba(255,106,0,0.15)] transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-[#FF6A00] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FF6A00] text-[#FF6A00]" />
                  ))}
                </div>

                <p className="text-xs text-white leading-relaxed italic font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#26262E]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.author}</h4>
                    <p className="text-[11px] text-[#E2E8F0]">{rev.role}</p>
                    <p className="text-[10px] text-[#94A3B8] font-mono">{rev.company}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
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
