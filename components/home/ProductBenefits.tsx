"use client";

import React from "react";
import {
  TrendingDown,
  ShieldCheck,
  Zap,
  Sliders,
  Lock,
  Trophy,
  PackageCheck,
  Check,
} from "lucide-react";

interface BenefitCard {
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  impacts: string[];
  icon: React.ElementType;
}

export function ProductBenefits() {
  const benefits: BenefitCard[] = [
    {
      title: "Eliminate Trapped Working Capital",
      metric: "-28.4%",
      metricLabel: "Average Buffer Inventory Reduction",
      description:
        "Stop tying up hundreds of thousands of dollars in excess slow-moving stock. DemandPulse's champion statistical modeling replaces arbitrary 'safety buffers' with mathematically rigorous variance curves.",
      impacts: [
        "Frees cash flow for high-margin SKU expansion",
        "Reduces warehouse holding and storage depreciation costs",
        "Prevents end-of-lifecycle inventory write-downs",
      ],
      icon: TrendingDown,
    },
    {
      title: "Prevent Revenue-Killing Stockouts",
      metric: "98.5%",
      metricLabel: "Fulfillment Cycle Service Level",
      description:
        "Every stockout is lost gross margin and damaged customer trust. Dynamic lead-time demand buffers automatically expand ahead of seasonal surges, ensuring stock is available when orders arrive.",
      impacts: [
        "Preserves marketplace vendor ratings and search rank",
        "Eliminates expensive emergency air-freight reorders",
        "Protects customer lifetime value (LTV)",
      ],
      icon: PackageCheck,
    },
    {
      title: "Single Champion Clarity",
      metric: "1 Line",
      metricLabel: "Operational Decisiveness, Zero Ambiguity",
      description:
        "Traditional forecasting tools overload non-technical buyers with a tangle of 5 overlapping trendlines. DemandPulse runs the tournament in the background and presents only the proven champion on the primary dashboard.",
      impacts: [
        "Aligns merchandising, purchasing, and finance on one source of truth",
        "Removes subjective bias and manual spreadsheet tampering",
        "Diagnostics drawer remains accessible for deep statistical inspection",
      ],
      icon: Trophy,
    },
    {
      title: "Instant Time-to-Value",
      metric: "<10 Sec",
      metricLabel: "Ingestion to Refitted Champion Model",
      description:
        "No multi-month enterprise consulting engagements or custom Python ETL pipelines. Simply drag and drop your historical sales files (CSV or Excel); our smart schema mapper does the rest instantly.",
      impacts: [
        "Automatic weekly/monthly cadence detection and gap interpolation",
        "Instant mock demo mode works without database provisioning",
        "Supports multi-SKU and multi-location datasets seamlessly",
      ],
      icon: Zap,
    },
    {
      title: "Scenario Stress-Testing on the Fly",
      metric: "Real-Time",
      metricLabel: "Dynamic Sensitivity Modeling",
      description:
        "What happens if your overseas supplier adds 10 days of shipping delay? What if marketing runs a 20% promotional flash sale? Adjust parameters dynamically with instant recalculation of safety stocks.",
      impacts: [
        "Interactive lead time and service level sliders",
        "Pre-empt supplier disruptions before inventory runs dry",
        "Model promotional upside without manual recalculation",
      ],
      icon: Sliders,
    },
    {
      title: "Control-Room Security & Compliance",
      metric: "Zero Leak",
      metricLabel: "Stateless Cryptographic Sessions",
      description:
        "Engineered with industrial resilience: HTTP-only stateless JWT cookies, bcrypt salt hashing, Postgres database segregation, and airtight tenant boundaries. Built for cloud and on-premise deployments.",
      impacts: [
        "Self-hostable via Docker Compose and standard PostgreSQL",
        "Prisma ORM schema migrations ensure bulletproof audit trails",
        "Stateless sessions resist token theft and cross-site scripting",
      ],
      icon: Lock,
    },
  ];

  return (
    <section id="benefits" className="relative py-24 bg-[#151518] border-t border-[#26262E]">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF6A00]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#0B0B0D] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>BUSINESS IMPACT & ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Quantifiable ROI for Supply-Chain & Finance Teams
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
            DemandPulse connects statistical rigor directly to your balance sheet. Here is how our
            customers protect margins and accelerate working capital velocity.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-xl bg-[#0B0B0D] p-6 border border-[#26262E] hover:border-[#FF6A00]/50 hover:shadow-[0_0_25px_rgba(255,106,0,0.15)] transition-all duration-300"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-2.5 rounded-lg bg-[#151518] border border-[#26262E] text-[#FF6A00] group-hover:border-[#FF6A00]/50 transition-colors shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E]">
                        {benefit.metric}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono uppercase">
                        {benefit.metricLabel}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-[#E2E8F0] leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Impact checklist */}
                  <div className="mt-5 space-y-2 border-t border-[#26262E] pt-4">
                    {benefit.impacts.map((impact, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-[#E2E8F0]">{impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
