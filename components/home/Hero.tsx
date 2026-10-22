"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestDemo = async () => {
    try {
      setIsGuestLoading(true);
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsGuestLoading(false);
    }
  };

  const tickerItems = [
    { label: "CHAMPION ACCURACY", val: "94.8% Backtested Mean", highlight: true },
    { label: "TOURNAMENT ENGINE", val: "4 Statistical Models per SKU", highlight: false },
    { label: "HOLDING INVENTORY", val: "-28.4% Buffer Waste", highlight: true },
    { label: "CYCLE SERVICE LEVEL", val: "98.5% On-Shelf Availability", highlight: false },
    { label: "INGESTION SPEED", val: "<10s Excel & CSV Parsing", highlight: true },
    { label: "AI COPILOT", val: "Grounded Root-Cause Synthesis", highlight: false },
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 bg-[#0B0B0D]">
      {/* Background Image with Deep Black Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop')",
        }}
      />
      {/* Radial Orange Glow & Dark Masking */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0D]/80 via-[#0B0B0D]/95 to-[#0B0B0D] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-[#FF6A00]/20 via-[#FF9D2E]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Champion Model Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#26262E] bg-[#151518]/90 px-4 py-1.5 text-xs text-[#E2E8F0] backdrop-blur-md shadow-[0_0_20px_rgba(255,106,0,0.15)] hover:border-[#FF6A00]/50 transition-all mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#FF6A00] animate-ping" />
            <span className="flex h-2 w-2 rounded-full bg-[#FF6A00] -ml-4" />
            <span className="font-mono text-[#FF6A00] font-semibold">Champion Paradigm</span>
            <span className="text-[#26262E]">|</span>
            <span className="text-white">4 Algorithms Backtested per SKU</span>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Forecast Demand with the Confidence of an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF851A] to-[#FF9D2E]">
              Operations Control Room
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-[#E2E8F0] max-w-2xl font-normal leading-relaxed">
            Eliminate costly stockouts and dead working capital. Upload raw sales spreadsheets,
            let our engine backtest competing models to crown the statistical champion, calibrate
            confidence bands, and generate grounded replenishment actions.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGuestDemo}
              disabled={isGuestLoading}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-sm shadow-lg shadow-[#FF6A00]/30 hover:shadow-[#FF6A00]/50 hover:brightness-110 transition-all active:scale-[0.98]"
            >
              {isGuestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>Try Instant Guest Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <a href="#features">
              <Button
                variant="outline"
                size="lg"
                className="text-sm font-medium border-[#26262E] bg-[#151518] text-white hover:border-[#FF6A00]/60 hover:text-white hover:shadow-[0_0_15px_rgba(255,106,0,0.2)]"
              >
                Tour Feature Suite
              </Button>
            </a>

            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-sm text-[#E2E8F0] hover:text-white">
                Sign in to Console
              </Button>
            </Link>
          </div>

          {/* Quick Micro-Trust */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#94A3B8] font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> No database setup required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Instant client demo dataset
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Enterprise PostgreSQL ready
            </span>
          </div>
        </div>

        {/* Feature Ticker Strip with Seamless Horizontal Scrolling */}
        <div className="mt-12 w-full overflow-hidden rounded-xl border border-[#26262E] bg-[#0B0B0D] py-3 shadow-2xl relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0B0D] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0B0D] to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 shrink-0">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  {item.label}:
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    item.highlight ? "text-[#FF6A00]" : "text-white"
                  }`}
                >
                  {item.val}
                </span>
                <span className="text-[#26262E] ml-3">|</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-4 w-full grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#151518] border border-[#26262E] hover:border-[#FF6A00]/40 transition-colors shadow-panel">
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]">
              <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" />
              <span>ACCURACY RATE</span>
            </div>
            <span className="mt-1 text-2xl font-extrabold font-mono text-white tracking-tight">
              94.8%
            </span>
            <span className="text-[10px] text-[#94A3B8]">Out-of-sample backtested</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#151518] border border-[#26262E] hover:border-[#FF6A00]/40 transition-colors shadow-panel">
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#FF6A00]">
              <Cpu className="h-3.5 w-3.5 text-[#FF6A00]" />
              <span>CHAMPION ENGINE</span>
            </div>
            <span className="mt-1 text-2xl font-extrabold font-mono text-[#FF6A00] tracking-tight">
              4 Models
            </span>
            <span className="text-[10px] text-[#94A3B8]">Tournament per SKU</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#151518] border border-[#26262E] hover:border-[#FF6A00]/40 transition-colors shadow-panel">
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#38BDF8]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>HOLDING REDUCTION</span>
            </div>
            <span className="mt-1 text-2xl font-extrabold font-mono text-[#38BDF8] tracking-tight">
              -28.4%
            </span>
            <span className="text-[10px] text-[#94A3B8]">Dead buffer inventory</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#151518] border border-[#26262E] hover:border-[#FF6A00]/40 transition-colors shadow-panel">
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#F59E0B]">
              <Layers className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>SERVICE LEVEL</span>
            </div>
            <span className="mt-1 text-2xl font-extrabold font-mono text-white tracking-tight">
              98.5%
            </span>
            <span className="text-[10px] text-[#94A3B8]">Cycle fill target</span>
          </div>
        </div>

        {/* Hero Interactive Terminal / Dashboard Mockup */}
        <div className="mt-10 relative mx-auto max-w-5xl rounded-xl border border-[#26262E] bg-[#151518] shadow-2xl shadow-black/80 overflow-hidden">
          {/* Mock Console Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1C1C22] border-b border-[#26262E] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] inline-block" />
              <span className="ml-2 text-white">demandpulse-console://app/dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Engine Active
              </span>
              <span className="text-[#26262E]">|</span>
              <span className="text-[11px] text-[#FF6A00] font-mono">
                Champion: Auto-ARIMA (p=1,d=1,q=2)
              </span>
            </div>
          </div>

          {/* Mock Console Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#0B0B0D] border border-[#26262E]">
                <div className="text-[11px] text-[#94A3B8] font-mono uppercase">Next 30D Forecast</div>
                <div className="text-xl font-bold font-mono text-[#FF6A00] mt-1">
                  14,820 <span className="text-xs font-normal text-[#94A3B8]">units</span>
                </div>
                <div className="text-[10px] text-[#10B981] font-mono mt-0.5">▲ +12.4% vs prev window</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0B0D] border border-[#26262E]">
                <div className="text-[11px] text-[#94A3B8] font-mono uppercase">Calculated Safety Stock</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  2,140 <span className="text-xs font-normal text-[#94A3B8]">units</span>
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">SL: 95.0% | Lead: 14d</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0B0D] border border-[#26262E]">
                <div className="text-[11px] text-[#94A3B8] font-mono uppercase">Reorder Point (ROP)</div>
                <div className="text-xl font-bold font-mono text-[#FF9D2E] mt-1">
                  5,890 <span className="text-xs font-normal text-[#94A3B8]">units</span>
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Trigger replenishment</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0B0D] border border-[#26262E]">
                <div className="text-[11px] text-[#94A3B8] font-mono uppercase">Champion WAPE</div>
                <div className="text-xl font-bold font-mono text-[#10B981] mt-1">
                  4.21% <span className="text-xs font-normal text-[#94A3B8]">error</span>
                </div>
                <div className="text-[10px] text-[#10B981] font-mono mt-0.5">Beats 3 contenders</div>
              </div>
            </div>

            {/* SVG Visual Chart Simulation */}
            <div className="rounded-lg bg-[#0B0B0D] border border-[#26262E] p-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#26262E] text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Activity className="h-4 w-4 text-[#FF6A00]" />
                  <span>Historical Actuals vs Champion Forecast Line</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#38BDF8]">
                    <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> Actuals
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FF6A00]">
                    <span className="h-2 w-2 rounded-full bg-[#FF6A00]" /> Champion Forecast
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FF9D2E] hidden sm:flex">
                    <span className="h-2 w-4 bg-[#FF6A00]/25 rounded" /> 95% Confidence Band
                  </div>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="h-44 sm:h-56 w-full pt-3">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FF6A00" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="#1E1E26" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#1E1E26" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#1E1E26" strokeDasharray="3 3" />

                  {/* Cutoff vertical line (History vs Forecast) */}
                  <line x1="440" y1="10" x2="440" y2="170" stroke="#94A3B8" strokeDasharray="4 4" />
                  <text x="445" y="24" fill="#E2E8F0" fontSize="10" fontFamily="monospace">
                    Forecast Horizon →
                  </text>

                  {/* Actuals area & line */}
                  <path
                    d="M 20 120 Q 80 130 120 110 T 220 95 T 320 125 T 440 85 L 440 170 L 20 170 Z"
                    fill="url(#actualGrad)"
                  />
                  <path
                    d="M 20 120 Q 80 130 120 110 T 220 95 T 320 125 T 440 85"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />

                  {/* Confidence Band Polygon */}
                  <path
                    d="M 440 85 L 520 65 L 600 50 L 700 35 L 780 20 L 780 110 L 700 95 L 600 90 L 520 105 Z"
                    fill="url(#bandGrad)"
                  />

                  {/* Champion Forecast Line */}
                  <path
                    d="M 440 85 L 520 80 L 600 68 L 700 62 L 780 55"
                    fill="none"
                    stroke="#FF6A00"
                    strokeWidth="3.2"
                  />

                  {/* Key nodes */}
                  <circle cx="440" cy="85" r="4.5" fill="#FFFFFF" stroke="#0B0B0D" strokeWidth="2" />
                  <circle cx="600" cy="68" r="4.5" fill="#FF6A00" stroke="#0B0B0D" strokeWidth="2" />
                  <circle cx="780" cy="55" r="4.5" fill="#FF9D2E" stroke="#0B0B0D" strokeWidth="2" />
                </svg>
              </div>

              {/* Bottom Copilot Callout Strip */}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-[#151518] border border-[#26262E] px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-white">
                  <Sparkles className="h-4 w-4 text-[#FF6A00] shrink-0" />
                  <span className="text-xs text-[#E2E8F0]">
                    <strong className="text-white">AI Copilot Analysis:</strong> "Model detected a 14% seasonal uplift entering Week 42. Auto-ARIMA was selected with lowest WAPE (4.21%). Recommend ordering 340 units buffer by Oct 28."
                  </span>
                </div>
                <button
                  onClick={handleGuestDemo}
                  className="shrink-0 text-xs font-mono text-[#FF6A00] hover:text-[#FF9D2E] hover:underline flex items-center gap-1 font-semibold"
                >
                  Inspect in App <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
