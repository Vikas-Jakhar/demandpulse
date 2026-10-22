"use client";

import React from "react";
import {
  TrendingDown,
  ShieldCheck,
  Zap,
  Sliders,
  Lock,
  Trophy,
  ArrowUpRight,
  DollarSign,
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
  accent: string;
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
      accent: "#4FD1C5",
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
      accent: "#3FBF7F",
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
      accent: "#F5A623",
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
      accent: "#F5A623",
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
      accent: "#4FD1C5",
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
      accent: "#3FBF7F",
    },
  ];

  return (
    <section id="benefits" className="relative py-24 bg-surface border-t border-border">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-actual/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-actual font-mono font-medium mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>BUSINESS IMPACT & ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Quantifiable ROI for Supply-Chain & Finance Teams
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted">
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
                className="group relative flex flex-col justify-between rounded-xl bg-canvas p-6 border border-border hover:border-border-raised hover:border-signal/40 transition-all duration-300 shadow-panel"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="p-2 rounded-lg bg-surface-raised border border-border group-hover:border-signal/50 transition-colors"
                      style={{ color: benefit.accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="text-right">
                      <div
                        className="text-xl font-bold font-mono tracking-tight"
                        style={{ color: benefit.accent }}
                      >
                        {benefit.metric}
                      </div>
                      <div className="text-[10px] text-ink-faint font-mono uppercase">
                        {benefit.metricLabel}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-ink group-hover:text-signal transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-ink-muted leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Impact checklist */}
                  <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
                    {benefit.impacts.map((impact, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-ink-faint">
                        <Check className="h-3.5 w-3.5 text-good shrink-0 mt-0.5" />
                        <span className="text-ink-muted">{impact}</span>
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
