"use client";

import React, { useState, useEffect } from "react";
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
  Send,
  Download,
} from "lucide-react";

interface FeatureSlide {
  id: string;
  tag: string;
  title: string;
  headline: string;
  headlineHighlight: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
  bgImage: string;
  renderMockup: () => React.ReactNode;
}

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const slideDuration = 6000;

  const slides: FeatureSlide[] = [
    {
      id: "champion-engine",
      tag: "CORE ALGORITHM",
      title: "The Champion Tournament",
      headline: "4 Models Enter. Exactly One Backtested",
      headlineHighlight: "Statistical Winner Surfaces.",
      description:
        "Never settle for a generic black-box forecast or a confusing spaghetti chart of 5 competing lines. Behind the scenes, DemandPulse backtests Auto-ARIMA, Holt-Winters Exponential Smoothing, Prophet-style Trend/Seasonality, and Moving Average across held-out validation periods. The algorithm with lowest WAPE is crowned champion and refit on the full dataset.",
      bullets: [
        "Rigorous out-of-sample backtesting against actual held-out sales",
        "WAPE & MASE error ranking eliminates statistical overfitting",
        "Only the champion renders on screen to preserve operational focus",
        "Full model diagnostics drawer available for deep data science audit",
      ],
      icon: Trophy,
      bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-[#0B0B0D]/90 backdrop-blur-md rounded-xl border border-[#26262E] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 shadow-[0_0_10px_rgba(255,106,0,0.2)]">
                <Trophy className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Backtest Tournament Matrix</h4>
                <p className="text-[10px] text-[#94A3B8]">SKU: IND-4029-X • Held-out: 8 Weeks</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
              CHAMPION SELECTED
            </span>
          </div>

          <div className="space-y-2.5 my-3">
            <div className="p-2.5 rounded-lg bg-[#151518] border border-[#FF6A00]/50 relative overflow-hidden shadow-[0_0_15px_rgba(255,106,0,0.15)]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF6A00] font-mono font-bold">#1 Auto-ARIMA (p=1,d=1,q=2)</span>
                  <span className="text-[9px] bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold px-1.5 py-0.5 rounded shadow-sm">
                    CHAMPION
                  </span>
                </div>
                <div className="font-mono text-[#FF6A00] font-bold">WAPE: 4.21%</div>
              </div>
              <div className="w-full bg-[#26262E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] h-full rounded-full" style={{ width: "95.8%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono mt-1">
                <span>Validation MAE: 42.1 units</span>
                <span className="text-[#10B981] font-semibold">★ Lowest Prediction Error</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#151518]/70 border border-[#26262E]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#E2E8F0] font-mono">#2 Holt-Winters Exp. Smoothing</span>
                <span className="font-mono text-[#94A3B8]">WAPE: 6.84%</span>
              </div>
              <div className="w-full bg-[#26262E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#94A3B8]/50 h-full rounded-full" style={{ width: "93.1%" }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#151518]/70 border border-[#26262E]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#E2E8F0] font-mono">#3 Prophet-Style Decomposition</span>
                <span className="font-mono text-[#94A3B8]">WAPE: 8.92%</span>
              </div>
              <div className="w-full bg-[#26262E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#94A3B8]/40 h-full rounded-full" style={{ width: "91.0%" }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#151518]/70 border border-[#26262E]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#E2E8F0] font-mono">#4 Weighted Moving Average</span>
                <span className="font-mono text-[#94A3B8]">WAPE: 11.45%</span>
              </div>
              <div className="w-full bg-[#26262E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#94A3B8]/30 h-full rounded-full" style={{ width: "88.5%" }} />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151518] border border-[#26262E] flex items-center justify-between text-xs text-[#E2E8F0]">
            <span className="text-[#94A3B8]">Selection Criterion:</span>
            <span className="text-[#FF6A00] font-mono text-[11px] font-bold">Min(WAPE) = 4.21% → Full Refit</span>
          </div>
        </div>
      ),
    },
    {
      id: "confidence-bands",
      tag: "RISK ENVELOPES",
      title: "Confidence Bands & Horizons",
      headline: "See Worst-Case and Best-Case",
      headlineHighlight: "Trajectories in Real Time.",
      description:
        "Point forecasts give a false sense of certainty. DemandPulse automatically generates 80% and 95% statistically calibrated uncertainty envelopes that widen naturally as lead time expands. Operations managers can stress-test supply buffers against upper-bound surges or lower-bound lulls.",
      bullets: [
        "Dual 80% (inner) and 95% (outer) confidence corridor calculation",
        "Lead-time compounding variance factors in seasonal volatility",
        "Clear visual demarcation between historical actuals and future projections",
        "Instant toggle for scenario sensitivity analysis",
      ],
      icon: TrendingUp,
      bgImage: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1600&auto=format&fit=crop",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-[#0B0B0D]/90 backdrop-blur-md rounded-xl border border-[#26262E] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 shadow-[0_0_10px_rgba(255,106,0,0.2)]">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Uncertainty Envelope Visualizer</h4>
                <p className="text-[10px] text-[#94A3B8]">90-Day Horizon with 95% CI Corridor</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-[#38BDF8]">● Actuals</span>
              <span className="text-[#FF6A00]">● Forecast</span>
              <span className="text-[#FF9D2E] bg-[#FF6A00]/15 px-1.5 py-0.5 rounded border border-[#FF6A00]/30">
                95% CI
              </span>
            </div>
          </div>

          <div className="my-2 h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 450 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="corridor95-roller" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="corridor80-roller" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <line x1="0" y1="35" x2="450" y2="35" stroke="#1E1E26" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="450" y2="70" stroke="#1E1E26" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="450" y2="105" stroke="#1E1E26" strokeDasharray="3 3" />

              <line x1="220" y1="5" x2="220" y2="135" stroke="#94A3B8" strokeDasharray="2 2" />
              <text x="225" y="16" fill="#E2E8F0" fontSize="9" fontFamily="monospace">Forecast Launch →</text>

              <path d="M 10 90 Q 60 110 110 75 T 170 85 T 220 60" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              <path d="M 220 60 L 280 40 L 350 25 L 430 15 L 430 115 L 350 95 L 280 80 Z" fill="url(#corridor95-roller)" />
              <path d="M 220 60 L 280 48 L 350 35 L 430 30 L 430 95 L 350 82 L 280 72 Z" fill="url(#corridor80-roller)" />
              <path d="M 220 60 L 280 58 L 350 50 L 430 46" fill="none" stroke="#FF6A00" strokeWidth="2.8" />

              <circle cx="220" cy="60" r="3.5" fill="#FFFFFF" />
              <circle cx="430" cy="46" r="3.5" fill="#FF6A00" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-[#151518] border border-[#26262E]">
              <span className="text-[10px] text-[#94A3B8] block font-mono">LOWER 95%</span>
              <span className="text-xs font-bold font-mono text-white">9,850 u</span>
            </div>
            <div className="p-2 rounded-lg bg-[#151518] border border-[#FF6A00]/40 shadow-[0_0_10px_rgba(255,106,0,0.15)]">
              <span className="text-[10px] text-[#FF6A00] block font-mono font-bold">CHAMPION MEAN</span>
              <span className="text-xs font-bold font-mono text-[#FF6A00]">12,400 u</span>
            </div>
            <div className="p-2 rounded-lg bg-[#151518] border border-[#26262E]">
              <span className="text-[10px] text-[#94A3B8] block font-mono">UPPER 95%</span>
              <span className="text-xs font-bold font-mono text-white">15,220 u</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "safety-stock",
      tag: "INVENTORY LOGIC",
      title: "Safety Stock & Reorder Points",
      headline: "Convert Mathematical Forecasts into",
      headlineHighlight: "Exact Purchase Triggers.",
      description:
        "Demand forecasts are only useful if they tell you what to purchase and when. DemandPulse translates predicted volume and lead-time variance into precise Safety Stock (SS) buffers and Reorder Points (ROP) calibrated to your required cycle service level (90% to 99.5%).",
      bullets: [
        "Dynamic Z-score calculation based on chosen cycle service level",
        "Lead-time demand standard deviation integration (LTD)",
        "Automated alerts when stock on hand approaches reorder thresholds",
        "Reduces over-ordering by 28% without triggering stockout penalties",
      ],
      icon: ShieldAlert,
      bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-[#0B0B0D]/90 backdrop-blur-md rounded-xl border border-[#26262E] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Safety Stock Engine</h4>
                <p className="text-[10px] text-[#94A3B8]">Service Level: 98.0% (Z = 2.05)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
              STOCK HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 rounded-lg bg-[#151518] border border-[#26262E]">
              <span className="text-[10px] text-[#94A3B8] font-mono block">RECOMMENDED BUFFER</span>
              <span className="text-lg font-bold font-mono text-[#10B981] mt-0.5 block">+1,420 units</span>
              <span className="text-[10px] text-[#94A3B8]">Standard Dev: σ = 184</span>
            </div>
            <div className="p-3 rounded-lg bg-[#151518] border border-[#26262E]">
              <span className="text-[10px] text-[#94A3B8] font-mono block">REORDER POINT (ROP)</span>
              <span className="text-lg font-bold font-mono text-[#FF9D2E] mt-0.5 block">4,890 units</span>
              <span className="text-[10px] text-[#94A3B8]">Lead Time: 14 business days</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#151518] border border-[#26262E]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white text-[11px] font-medium">Current Stock vs Reorder Threshold</span>
              <span className="font-mono text-[11px] text-white">6,240 / 4,890 u</span>
            </div>
            <div className="w-full bg-[#26262E] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#10B981] h-full" style={{ width: "72%" }} />
              <div className="bg-[#FF9D2E] h-full" style={{ width: "20%" }} />
              <div className="bg-[#EF4444] h-full" style={{ width: "8%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono mt-1.5">
              <span>Healthy Zone (72%)</span>
              <span className="text-[#FF9D2E] font-medium">Reorder Trigger: ~18 Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#151518] border border-[#26262E] text-[11px] text-[#E2E8F0]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
            <span>Optimal order batch size: <strong className="text-white">3,500 units</strong> via EOQ formula.</span>
          </div>
        </div>
      ),
    },
    {
      id: "ai-copilot",
      tag: "EMBEDDED INTELLIGENCE",
      title: "Grounded AI Copilot",
      headline: "An AI Assistant Grounded in",
      headlineHighlight: "Real Numbers, Not Guesses.",
      description:
        "DemandPulse embeds an LLM copilot that has direct situational awareness of your active dataset, model candidates, seasonality factors, and calculated safety stocks. Ask complex operational questions in plain English and receive instant quantitative answers with root-cause explanations.",
      bullets: [
        "Fully grounded in active on-screen chart metrics (no hallucinated figures)",
        "Detects unexpected variance, supplier lead delays, and promotional lifts",
        "Generates executive briefing notes and draft purchase orders instantly",
        "Powered by modern Claude & Gemini reasoning engines",
      ],
      icon: Sparkles,
      bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-[#0B0B0D]/90 backdrop-blur-md rounded-xl border border-[#26262E] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 shadow-[0_0_10px_rgba(255,106,0,0.2)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Copilot Intelligence Console</h4>
                <p className="text-[10px] text-[#94A3B8]">Context: Active Forecast & Dataset</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/30 px-2 py-0.5 rounded font-bold">
              ONLINE
            </span>
          </div>

          <div className="space-y-3 my-2 text-xs">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-[#1C1C22] border border-[#26262E] px-3 py-2 text-white">
                <p className="text-[11px]">Why is next month's forecast spiking by 24% for Category B?</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[95%] rounded-lg bg-[#151518] border border-[#FF6A00]/40 px-3.5 py-2.5 space-y-1.5 shadow-[0_0_15px_rgba(255,106,0,0.1)]">
                <div className="flex items-center gap-1.5 text-[#FF6A00] text-[11px] font-bold">
                  <Sparkles className="h-3 w-3" /> DemandPulse Copilot
                </div>
                <p className="text-[11px] leading-relaxed text-white">
                  The spike is driven by two confirmed signals in your historical data:
                </p>
                <div className="space-y-1 text-[10px] font-mono pl-2 border-l border-[#FF6A00]/50">
                  <div className="text-[#E2E8F0]">1. Strong seasonal autocorrelation at lag=52 (annual peak in Nov).</div>
                  <div className="text-[#E2E8F0]">2. Auto-ARIMA fitted an extra +8.2% trend momentum based on recent Q3 velocity.</div>
                </div>
                <p className="text-[10px] text-[#10B981] font-semibold">
                  ✔ Recommendation: Increase safety buffer by 320 units by Nov 4th.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#26262E]">
            <input
              type="text"
              readOnly
              value="Draft a supplier purchase order summary..."
              className="w-full bg-[#151518] border border-[#26262E] rounded-md px-3 py-1.5 text-xs text-[#94A3B8] focus:outline-none"
            />
            <button className="p-1.5 rounded-md bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white hover:brightness-110">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "ingestion-export",
      tag: "DATA INGESTION",
      title: "Universal Ingestion & Reports",
      headline: "Drop in Raw CSV or Excel. Export",
      headlineHighlight: "Boardroom-Ready Reports.",
      description:
        "No complex ETL pipelines or data formatting gymnastics. Drag and drop any sales history spreadsheet; our parser automatically identifies date columns, SKU identifiers, and sales volume quantities. Export statistical summaries to Excel or branded executive PDF memos in one click.",
      bullets: [
        "Smart schema inference for CSV, XLSX, and multi-column formats",
        "Automatic weekly/monthly resampling and gap-filling",
        "Prisma database persistence for secure multi-dataset history",
        "One-click PDF briefing memo & structured Excel workbook exports",
      ],
      icon: FileSpreadsheet,
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop",
      renderMockup: () => (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between bg-[#0B0B0D]/90 backdrop-blur-md rounded-xl border border-[#26262E] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Smart Dataset Parser</h4>
                <p className="text-[10px] text-[#94A3B8]">q4_sales_actuals_2026.xlsx • 10,480 Rows</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
              SCHEMA VERIFIED
            </span>
          </div>

          <div className="my-2 rounded border border-[#26262E] overflow-hidden text-[10px] font-mono">
            <div className="grid grid-cols-3 bg-[#1C1C22] p-2 text-[#94A3B8] border-b border-[#26262E]">
              <span>DETECTED COLUMN</span>
              <span>MAPPED ROLE</span>
              <span className="text-right">CONFIDENCE</span>
            </div>
            <div className="grid grid-cols-3 p-2 border-b border-[#1E1E26] text-white bg-[#0B0B0D]">
              <span>transaction_date</span>
              <span className="text-[#FF6A00]">timestamp (ISO 8601)</span>
              <span className="text-right text-[#10B981]">100%</span>
            </div>
            <div className="grid grid-cols-3 p-2 border-b border-[#1E1E26] text-white bg-[#0B0B0D]">
              <span>sku_code</span>
              <span className="text-[#38BDF8]">item_identifier</span>
              <span className="text-right text-[#10B981]">100%</span>
            </div>
            <div className="grid grid-cols-3 p-2 text-white bg-[#0B0B0D]">
              <span>units_shipped</span>
              <span className="text-[#FF9D2E]">sales_volume</span>
              <span className="text-right text-[#10B981]">100%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#151518] border border-[#26262E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-[#FF6A00]" />
              <span className="text-xs text-white font-semibold">Export Executive Package</span>
            </div>
            <div className="flex gap-2">
              <button className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#1C1C22] border border-[#26262E] text-white hover:border-[#FF6A00]">
                .XLSX Data
              </button>
              <button className="px-2.5 py-1 text-[11px] font-mono rounded bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold hover:brightness-110">
                .PDF Brief
              </button>
            </div>
          </div>

          <div className="text-[10px] text-[#94A3B8] font-mono flex items-center justify-between">
            <span>Cadence: Weekly aggregation</span>
            <span>Zero missing values detected</span>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50;
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
    <section id="features" className="relative py-24 bg-[#0B0B0D] border-t border-[#26262E]">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-[#FF6A00]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#151518] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Engineered for Ground-Truth Supply Chain Operations
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
            Explore the integrated modules that turn noisy historical sales data into resilient,
            auditable inventory and forecasting decisions.
          </p>
        </div>

        {/* Carousel Tabs Navigation */}
        <div className="mt-12 flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 no-scrollbar">
          {slides.map((slide, idx) => {
            const TabIcon = slide.icon;
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                onClick={() => handleSelectSlide(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all duration-200 relative ${
                  isActive
                    ? "bg-[#151518] border-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/20"
                    : "bg-[#0B0B0D] border-[#26262E] text-[#94A3B8] hover:text-white hover:border-[#FF6A00]/40"
                }`}
              >
                <TabIcon
                  className={`h-4 w-4 ${isActive ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}
                />
                <span>{slide.title}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] rounded-b" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Feature Roller Card with Background Image & Gradient Mask */}
        <div className="mt-6 rounded-2xl border border-[#26262E] bg-[#151518] shadow-2xl shadow-black/90 overflow-hidden relative">
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url('${currentSlide.bgImage}')` }}
          />
          {/* Dark Gradient Overlay for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/95 via-[#151518]/90 to-[#0B0B0D]/95 pointer-events-none" />

          {/* Progress Bar & Controls Header */}
          <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-[#151518]/90 border-b border-[#26262E] text-xs backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#FF6A00] font-bold text-sm">
                0{activeIndex + 1} / 0{slides.length}
              </span>
              <span className="text-[#26262E]">|</span>
              <span className="text-[#E2E8F0] font-mono uppercase text-[11px] tracking-wider">
                {currentSlide.tag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded hover:bg-[#1C1C22] text-[#94A3B8] hover:text-[#FF6A00] transition-colors"
                title={isPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-[#FF6A00]" />}
              </button>
              <button
                onClick={handlePrev}
                className="p-1.5 rounded hover:bg-[#1C1C22] text-[#94A3B8] hover:text-[#FF6A00] transition-colors"
                title="Previous feature"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded hover:bg-[#1C1C22] text-[#94A3B8] hover:text-[#FF6A00] transition-colors"
                title="Next feature"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Running Progress Bar in Orange Gradient */}
          <div className="relative z-10 w-full bg-[#1E1E26] h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] h-full transition-all duration-75 ease-linear shadow-[0_0_10px_#FF6A00]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Slide Content: Left Text / Right Interactive Mockup */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
            {/* Left Column: Feature Narrative */}
            <div className="lg:col-span-6 space-y-5 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded bg-[#FF6A00]/15 px-3 py-1 text-xs font-mono font-bold text-[#FF6A00] border border-[#FF6A00]/30 shadow-[0_0_10px_rgba(255,106,0,0.15)]">
                <IconComponent className="h-3.5 w-3.5" />
                <span>{currentSlide.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {currentSlide.headline}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF851A] to-[#FF9D2E]">
                  {currentSlide.headlineHighlight}
                </span>
              </h3>

              <p className="text-sm text-[#E2E8F0] leading-relaxed">
                {currentSlide.description}
              </p>

              {/* Bullet Checklist */}
              <div className="space-y-2.5 pt-2">
                {currentSlide.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-normal">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <div className="pt-4 flex items-center gap-4">
                <a
                  href="#sandbox"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF6A00] hover:text-[#FF9D2E] hover:underline transition-colors"
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
