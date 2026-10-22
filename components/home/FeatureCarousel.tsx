"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  CheckCircle2,
  Layers,
  Percent,
  Calendar,
  AlertTriangle,
  Send,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureSlide {
  id: string;
  tag: string;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
  accentColor: string;
  renderMockup: () => React.ReactNode;
}

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const slideDuration = 6000; // 6 seconds per slide

  const slides: FeatureSlide[] = [
    {
      id: "champion-engine",
      tag: "CORE ALGORITHM",
      title: "The Champion Model Tournament",
      headline: "4 Models Enter. Exactly One Backtested Winner Surfaces.",
      description:
        "Never settle for a generic black-box forecast or a confusing spaghetti chart of 5 competing lines. Behind the scenes, DemandPulse backtests Auto-ARIMA, Holt-Winters Exponential Smoothing, Prophet-style Trend/Seasonality, and Moving Average across held-out validation periods. The algorithm with lowest WAPE is crowned champion and refit on the full dataset.",
      bullets: [
        "Rigorous out-of-sample backtesting against actual held-out sales",
        "WAPE & MASE error ranking eliminates overfitting",
        "Only the champion renders on screen to preserve operational focus",
        "Full model diagnostics drawer available for deep data science audit",
      ],
      icon: Trophy,
      accentColor: "#F5A623",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-canvas/90 rounded-xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-signal/15 text-signal border border-signal/30">
                <Trophy className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-ink">Backtest Tournament Matrix</h4>
                <p className="text-[10px] text-ink-muted">SKU: IND-4029-X • Held-out: 8 Weeks</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-good bg-good/10 border border-good/20 px-2 py-0.5 rounded">
              CHAMPION SELECTED
            </span>
          </div>

          {/* Tournament Comparison Rows */}
          <div className="space-y-2.5 my-3">
            {/* Model 1 - Champion */}
            <div className="p-2.5 rounded-lg bg-surface-raised border border-signal/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-signal font-mono font-bold">#1 Auto-ARIMA (p=1,d=1,q=2)</span>
                  <span className="text-[9px] bg-signal text-canvas font-bold px-1.5 py-0.2 rounded">
                    CHAMPION
                  </span>
                </div>
                <div className="font-mono text-signal font-bold">WAPE: 4.21%</div>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-signal h-full rounded-full" style={{ width: "95.8%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-ink-faint font-mono mt-1">
                <span>Validation MAE: 42.1 units</span>
                <span className="text-good font-semibold">★ Lowest Prediction Error</span>
              </div>
            </div>

            {/* Model 2 */}
            <div className="p-2.5 rounded-lg bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ink-muted font-mono">#2 Holt-Winters Exp. Smoothing</span>
                <span className="font-mono text-ink-muted">WAPE: 6.84%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-ink-muted/50 h-full rounded-full" style={{ width: "93.1%" }} />
              </div>
            </div>

            {/* Model 3 */}
            <div className="p-2.5 rounded-lg bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ink-muted font-mono">#3 Prophet-Style Decomposition</span>
                <span className="font-mono text-ink-muted">WAPE: 8.92%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-ink-muted/40 h-full rounded-full" style={{ width: "91.0%" }} />
              </div>
            </div>

            {/* Model 4 */}
            <div className="p-2.5 rounded-lg bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ink-muted font-mono">#4 Weighted Moving Average</span>
                <span className="font-mono text-ink-muted">WAPE: 11.45%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-ink-muted/30 h-full rounded-full" style={{ width: "88.5%" }} />
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-2 rounded bg-surface border border-border/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Automated Selection Protocol:</span>
            <span className="text-ink font-mono text-[10px]">Min(WAPE) = 4.21% → Full Dataset Refit</span>
          </div>
        </div>
      ),
    },
    {
      id: "confidence-bands",
      tag: "RISK ENVELOPES",
      title: "Confidence Bands & Horizon Bounds",
      headline: "See Worst-Case and Best-Case Trajectories in Real Time.",
      description:
        "Point forecasts give a false sense of certainty. DemandPulse automatically generates 80% and 95% statistically calibrated uncertainty envelopes that widen naturally as lead time expands. Operations managers can stress-test supply buffers against upper-bound surges or lower-bound lulls.",
      bullets: [
        "Dual 80% (inner) and 95% (outer) confidence corridor calculation",
        "Lead-time compounding variance factors in seasonal volatility",
        "Clear visual demarcation between historical actuals and future projections",
        "Instant toggle for scenario sensitivity analysis",
      ],
      icon: TrendingUp,
      accentColor: "#4FD1C5",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-canvas/90 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-actual/15 text-actual border border-actual/30">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-ink">Uncertainty Envelope Visualizer</h4>
                <p className="text-[10px] text-ink-muted">90-Day Horizon with 95% CI Corridor</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-actual">● Actuals</span>
              <span className="text-signal">● Forecast</span>
              <span className="text-signal/70 bg-signal/15 px-1.5 py-0.5 rounded">95% CI</span>
            </div>
          </div>

          {/* Visual SVG Corridor */}
          <div className="my-2 h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="corridor95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="corridor80" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <line x1="0" y1="35" x2="450" y2="35" stroke="#232A34" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="450" y2="70" stroke="#232A34" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="450" y2="105" stroke="#232A34" strokeDasharray="3 3" />

              <line x1="220" y1="5" x2="220" y2="135" stroke="#5B6472" strokeDasharray="2 2" />
              <text x="225" y="16" fill="#8A93A1" fontSize="9" fontFamily="monospace">Forecast Launch →</text>

              {/* Actuals Line */}
              <path
                d="M 10 90 Q 60 110 110 75 T 170 85 T 220 60"
                fill="none"
                stroke="#4FD1C5"
                strokeWidth="2.5"
              />

              {/* Outer 95% Confidence Band */}
              <path
                d="M 220 60 L 280 40 L 350 25 L 430 15 L 430 115 L 350 95 L 280 80 Z"
                fill="url(#corridor95)"
              />

              {/* Inner 80% Confidence Band */}
              <path
                d="M 220 60 L 280 48 L 350 35 L 430 30 L 430 95 L 350 82 L 280 72 Z"
                fill="url(#corridor80)"
              />

              {/* Champion Median Trajectory */}
              <path
                d="M 220 60 L 280 58 L 350 50 L 430 46"
                fill="none"
                stroke="#F5A623"
                strokeWidth="2.5"
              />

              <circle cx="220" cy="60" r="3.5" fill="#E8EAED" />
              <circle cx="430" cy="46" r="3.5" fill="#F5A623" />
            </svg>
          </div>

          {/* Telemetry Footer */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-surface border border-border/60">
              <span className="text-[10px] text-ink-muted block font-mono">LOWER 95%</span>
              <span className="text-xs font-bold font-mono text-ink">9,850 u</span>
            </div>
            <div className="p-2 rounded bg-surface-raised border border-signal/40">
              <span className="text-[10px] text-signal block font-mono">CHAMPION MEAN</span>
              <span className="text-xs font-bold font-mono text-signal">12,400 u</span>
            </div>
            <div className="p-2 rounded bg-surface border border-border/60">
              <span className="text-[10px] text-ink-muted block font-mono">UPPER 95%</span>
              <span className="text-xs font-bold font-mono text-ink">15,220 u</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "safety-stock",
      tag: "INVENTORY LOGIC",
      title: "Automated Safety Stock & Reorder Points",
      headline: "Convert Mathematical Forecasts into Exact Purchase Triggers.",
      description:
        "Demand forecasts are only useful if they tell you what to purchase and when. DemandPulse translates predicted volume and lead-time variance into precise Safety Stock (SS) buffers and Reorder Points (ROP) calibrated to your required cycle service level (90% to 99.5%).",
      bullets: [
        "Dynamic Z-score calculation based on chosen cycle service level",
        "Lead-time demand standard deviation integration (LTD)",
        "Automated alerts when stock on hand approaches reorder thresholds",
        "Reduces over-ordering by 28% without triggering stockout penalties",
      ],
      icon: ShieldAlert,
      accentColor: "#3FBF7F",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-canvas/90 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-good/15 text-good border border-good/30">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-ink">Safety Stock Engine</h4>
                <p className="text-[10px] text-ink-muted">Service Level: 98.0% (Z = 2.05)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-good bg-good/10 border border-good/20 px-2 py-0.5 rounded">
              STOCK HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 rounded-lg bg-surface border border-border">
              <span className="text-[10px] text-ink-muted font-mono block">RECOMMENDED BUFFER</span>
              <span className="text-lg font-bold font-mono text-good mt-0.5 block">+1,420 units</span>
              <span className="text-[10px] text-ink-faint">Standard Dev: σ = 184</span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border">
              <span className="text-[10px] text-ink-muted font-mono block">REORDER POINT (ROP)</span>
              <span className="text-lg font-bold font-mono text-warn mt-0.5 block">4,890 units</span>
              <span className="text-[10px] text-ink-faint">Lead Time: 14 business days</span>
            </div>
          </div>

          {/* Visual Stockout Risk Gauge */}
          <div className="p-3 rounded-lg bg-surface-raised border border-border-soft">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink text-[11px] font-medium">Current Stock vs Reorder Threshold</span>
              <span className="font-mono text-[11px] text-ink">6,240 / 4,890 u</span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden flex">
              <div className="bg-good h-full" style={{ width: "72%" }} />
              <div className="bg-warn/80 h-full" style={{ width: "20%" }} />
              <div className="bg-bad h-full" style={{ width: "8%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-ink-faint font-mono mt-1.5">
              <span>Healthy Zone (72%)</span>
              <span className="text-warn">Reorder Trigger: ~18 Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-surface border border-border/50 text-[11px] text-ink-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-good shrink-0" />
            <span>Optimal order batch size: <strong>3,500 units</strong> via Economic Order Quantity.</span>
          </div>
        </div>
      ),
    },
    {
      id: "ai-copilot",
      tag: "EMBEDDED INTELLIGENCE",
      title: "Grounded AI Supply-Chain Copilot",
      headline: "An AI Assistant Grounded in Real Numbers, Not Generic Advice.",
      description:
        "DemandPulse embeds an LLM copilot that has direct situational awareness of your active dataset, model candidates, seasonality factors, and calculated safety stocks. Ask complex operational questions in plain English and receive instant quantitative answers with root-cause explanations.",
      bullets: [
        "Fully grounded in active on-screen chart metrics (no hallucinated figures)",
        "Detects unexpected variance, supplier lead delays, and promotional lifts",
        "Generates executive briefing notes and draft purchase orders instantly",
        "Powered by modern Claude & Gemini reasoning engines",
      ],
      icon: Sparkles,
      accentColor: "#F5A623",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-canvas/90 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-signal/15 text-signal border border-signal/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-ink">Copilot Intelligence Console</h4>
                <p className="text-[10px] text-ink-muted">Context: Active Forecast & Dataset</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-signal bg-signal/10 border border-signal/30 px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 my-2 text-xs">
            {/* User prompt */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-surface-raised border border-border px-3 py-2 text-ink">
                <p className="text-[11px]">Why is next month's forecast spiking by 24% for Category B?</p>
              </div>
            </div>

            {/* Copilot response */}
            <div className="flex justify-start">
              <div className="max-w-[95%] rounded-lg bg-surface border border-signal/30 px-3.5 py-2.5 text-ink-muted space-y-1.5">
                <div className="flex items-center gap-1.5 text-signal text-[11px] font-semibold">
                  <Sparkles className="h-3 w-3" /> DemandPulse Copilot
                </div>
                <p className="text-[11px] leading-relaxed text-ink">
                  The spike is driven by two confirmed signals in your historical data:
                </p>
                <div className="space-y-1 text-[10px] font-mono pl-2 border-l border-signal/40">
                  <div className="text-ink">1. Strong seasonal autocorrelation at lag=52 (annual peak in Nov).</div>
                  <div className="text-ink">2. Auto-ARIMA fitted an extra +8.2% trend momentum based on recent Q3 velocity.</div>
                </div>
                <p className="text-[10px] text-good">
                  ✔ Recommendation: Increase safety buffer by 320 units by Nov 4th.
                </p>
              </div>
            </div>
          </div>

          {/* Mock Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/60">
            <input
              type="text"
              readOnly
              value="Draft a supplier purchase order summary..."
              className="w-full bg-surface-raised border border-border rounded px-3 py-1.5 text-xs text-ink-faint focus:outline-none"
            />
            <button className="p-1.5 rounded bg-signal text-canvas hover:bg-signal/90">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "ingestion-export",
      tag: "DATA INGESTION",
      title: "Universal Ingestion & Executive Reports",
      headline: "Drop in Raw CSV or Excel. Export Boardroom-Ready Reports.",
      description:
        "No complex ETL pipelines or data formatting gymnastics. Drag and drop any sales history spreadsheet; our parser automatically identifies date columns, SKU identifiers, and sales volume quantities. Export statistical summaries to Excel or branded executive PDF memos in one click.",
      bullets: [
        "Smart schema inference for CSV, XLSX, and multi-column formats",
        "Automatic weekly/monthly resampling and gap-filling",
        "Prisma database persistence for secure multi-dataset history",
        "One-click PDF briefing memo & structured Excel workbook exports",
      ],
      icon: FileSpreadsheet,
      accentColor: "#4FD1C5",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-canvas/90 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-actual/15 text-actual border border-actual/30">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-ink">Smart Dataset Parser</h4>
                <p className="text-[10px] text-ink-muted">q4_sales_actuals_2026.xlsx • 10,480 Rows</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-good bg-good/10 border border-good/20 px-2 py-0.5 rounded">
              SCHEMA VERIFIED
            </span>
          </div>

          {/* Ingestion Table Preview */}
          <div className="my-2 rounded border border-border overflow-hidden text-[10px] font-mono">
            <div className="grid grid-cols-3 bg-surface-raised p-2 text-ink-muted border-b border-border">
              <span>DETECTED COLUMN</span>
              <span>MAPPED ROLE</span>
              <span className="text-right">CONFIDENCE</span>
            </div>
            <div className="grid grid-cols-3 p-2 border-b border-border/40 text-ink">
              <span>transaction_date</span>
              <span className="text-signal">timestamp (ISO 8601)</span>
              <span className="text-right text-good">100%</span>
            </div>
            <div className="grid grid-cols-3 p-2 border-b border-border/40 text-ink">
              <span>sku_code</span>
              <span className="text-actual">item_identifier</span>
              <span className="text-right text-good">100%</span>
            </div>
            <div className="grid grid-cols-3 p-2 text-ink">
              <span>units_shipped</span>
              <span className="text-warn">sales_volume</span>
              <span className="text-right text-good">100%</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-3 rounded-lg bg-surface border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-signal" />
              <span className="text-xs text-ink font-medium">Export Executive Package</span>
            </div>
            <div className="flex gap-2">
              <button className="px-2.5 py-1 text-[11px] font-mono rounded bg-surface-raised border border-border text-ink hover:border-signal">
                .XLSX Data
              </button>
              <button className="px-2.5 py-1 text-[11px] font-mono rounded bg-signal text-canvas font-semibold hover:bg-signal/90">
                .PDF Brief
              </button>
            </div>
          </div>

          <div className="text-[10px] text-ink-faint font-mono flex items-center justify-between">
            <span>Cadence: Weekly aggregation</span>
            <span>Zero missing values detected</span>
          </div>
        </div>
      ),
    },
  ];

  // Auto-play timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50; // update progress every 50ms
    const step = (interval / slideDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, activeIndex, slides.length]);

  const handleSelectSlide = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const currentSlide = slides[activeIndex];
  const IconComponent = currentSlide.icon;

  return (
    <section id="features" className="relative py-24 bg-canvas border-t border-border">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-signal/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-signal font-mono font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Engineered for Ground-Truth Supply Chain Operations
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted">
            Explore the integrated modules that turn noisy historical sales data into resilient,
            auditable inventory and forecasting decisions.
          </p>
        </div>

        {/* Carousel Tabs Navigation */}
        <div className="mt-12 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {slides.map((slide, idx) => {
            const TabIcon = slide.icon;
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                onClick={() => handleSelectSlide(idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all duration-200 relative ${
                  isActive
                    ? "bg-surface-raised border-signal text-ink shadow-md shadow-signal/10"
                    : "bg-surface border-border/80 text-ink-muted hover:text-ink hover:border-border"
                }`}
              >
                <TabIcon
                  className={`h-4 w-4 ${isActive ? "text-signal" : "text-ink-muted"}`}
                />
                <span>{slide.title}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-signal rounded-b" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Carousel Display Card */}
        <div className="mt-6 rounded-2xl border border-border bg-surface shadow-xl shadow-black/40 overflow-hidden">
          {/* Progress Bar & Controls Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-surface-raised border-b border-border text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-signal font-semibold">
                0{activeIndex + 1} / 0{slides.length}
              </span>
              <span className="text-border">|</span>
              <span className="text-ink-muted font-mono uppercase text-[11px]">
                {currentSlide.tag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                title={isPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-signal" />}
              </button>
              <button
                onClick={handlePrev}
                className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                title="Previous feature"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                title="Next feature"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Running Progress Bar */}
          <div className="w-full bg-border-soft h-1 overflow-hidden">
            <div
              className="bg-signal h-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Slide Content: Left Text / Right Interactive Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
            {/* Left Column: Feature Narrative */}
            <div className="lg:col-span-6 space-y-5 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded bg-signal/10 px-2.5 py-1 text-xs font-mono text-signal border border-signal/20">
                <IconComponent className="h-3.5 w-3.5" />
                <span>{currentSlide.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {currentSlide.headline}
              </h3>

              <p className="text-sm text-ink-muted leading-relaxed">
                {currentSlide.description}
              </p>

              {/* Bullet Checklist */}
              <div className="space-y-2.5 pt-2">
                {currentSlide.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-ink">
                    <CheckCircle2 className="h-4 w-4 text-good shrink-0 mt-0.5" />
                    <span className="leading-normal">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <div className="pt-4 flex items-center gap-4">
                <a
                  href="#sandbox"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-signal hover:underline"
                >
                  <span>Test in Live Sandbox</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Visual Component Mockup */}
            <div className="lg:col-span-6 h-[380px] sm:h-[420px] w-full flex items-center justify-center animate-fade-in">
              {currentSlide.renderMockup()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
