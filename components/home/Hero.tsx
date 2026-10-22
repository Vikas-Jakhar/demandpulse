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
  Database,
  Loader2,
  BarChart3,
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

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-signal/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-actual/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#E8EAED 1px, transparent 1px), linear-gradient(90deg, #E8EAED 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Champion Model Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised/80 px-3.5 py-1 text-xs text-ink-muted backdrop-blur-sm shadow-panel hover:border-signal/40 transition-colors mb-6">
            <span className="flex h-2 w-2 rounded-full bg-signal animate-ping" />
            <span className="flex h-2 w-2 rounded-full bg-signal -ml-4" />
            <span className="font-mono text-signal font-medium">Champion Paradigm</span>
            <span className="text-border">|</span>
            <span>4 Algorithms Backtested per SKU</span>
            <ChevronRight className="h-3 w-3 text-ink-faint" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.12]">
            Forecast Demand with the Confidence of an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal via-[#FBC02D] to-forecast">
              Operations Control Room
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl font-normal leading-relaxed">
            Eliminate costly stockouts and dead working capital. Upload raw sales spreadsheets,
            let our engine backtest competing models to select the statistical champion, calibrate
            confidence bands, and generate grounded replenishment actions.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={handleGuestDemo}
              disabled={isGuestLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-signal text-canvas font-semibold text-sm hover:bg-signal/90 shadow-lg shadow-signal/20 transition-all active:scale-[0.98]"
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
              <Button variant="outline" size="lg" className="text-sm font-medium">
                Tour Feature Suite
              </Button>
            </a>

            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-sm text-ink-muted hover:text-ink">
                Sign in to Console
              </Button>
            </Link>
          </div>

          {/* Quick Micro-Trust */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-ink-faint font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-good" /> No database setup required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-good" /> Instant client demo dataset
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-good" /> Enterprise PostgreSQL ready
            </span>
          </div>

          {/* Live Telemetry Ribbon */}
          <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 border border-border/80 bg-surface/60 rounded-xl p-3 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-raised/40 border border-border-soft">
              <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                <TrendingUp className="h-3.5 w-3.5 text-good" />
                <span>ACCURACY RATE</span>
              </div>
              <span className="mt-1 text-2xl font-bold font-mono text-ink tracking-tight">
                94.8%
              </span>
              <span className="text-[10px] text-ink-faint">Out-of-sample backtested</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-raised/40 border border-border-soft">
              <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                <Cpu className="h-3.5 w-3.5 text-signal" />
                <span>CHAMPION ENGINE</span>
              </div>
              <span className="mt-1 text-2xl font-bold font-mono text-signal tracking-tight">
                4 Models
              </span>
              <span className="text-[10px] text-ink-faint">Tournament per SKU</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-raised/40 border border-border-soft">
              <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-actual" />
                <span>HOLDING REDUCTION</span>
              </div>
              <span className="mt-1 text-2xl font-bold font-mono text-actual tracking-tight">
                -28.4%
              </span>
              <span className="text-[10px] text-ink-faint">Dead buffer inventory</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-raised/40 border border-border-soft">
              <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
                <Layers className="h-3.5 w-3.5 text-warn" />
                <span>SERVICE LEVEL</span>
              </div>
              <span className="mt-1 text-2xl font-bold font-mono text-ink tracking-tight">
                98.5%
              </span>
              <span className="text-[10px] text-ink-faint">Cycle fill target</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal / Dashboard Mockup */}
        <div className="mt-12 relative mx-auto max-w-5xl rounded-xl border border-border bg-surface shadow-2xl shadow-black/60 overflow-hidden">
          {/* Mock Console Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-raised border-b border-border text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-bad/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-warn/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-good/80 inline-block" />
              <span className="ml-2 text-ink-muted">demandpulse-console://app/dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] text-good">
                <span className="h-1.5 w-1.5 rounded-full bg-good animate-pulse" />
                Engine Active
              </span>
              <span className="text-ink-faint">|</span>
              <span className="text-[11px] text-signal font-mono">Champion: Auto-ARIMA (p=1,d=1,q=2)</span>
            </div>
          </div>

          {/* Mock Console Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-canvas border border-border/70">
                <div className="text-[11px] text-ink-muted font-mono uppercase">Next 30D Forecast</div>
                <div className="text-xl font-bold font-mono text-signal mt-1">14,820 <span className="text-xs font-normal text-ink-muted">units</span></div>
                <div className="text-[10px] text-good font-mono mt-0.5">▲ +12.4% vs prev window</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border/70">
                <div className="text-[11px] text-ink-muted font-mono uppercase">Calculated Safety Stock</div>
                <div className="text-xl font-bold font-mono text-ink mt-1">2,140 <span className="text-xs font-normal text-ink-muted">units</span></div>
                <div className="text-[10px] text-ink-faint font-mono mt-0.5">SL: 95.0% | Lead: 14d</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border/70">
                <div className="text-[11px] text-ink-muted font-mono uppercase">Reorder Point (ROP)</div>
                <div className="text-xl font-bold font-mono text-warn mt-1">5,890 <span className="text-xs font-normal text-ink-muted">units</span></div>
                <div className="text-[10px] text-ink-faint font-mono mt-0.5">Trigger replenishment</div>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border/70">
                <div className="text-[11px] text-ink-muted font-mono uppercase">Champion WAPE</div>
                <div className="text-xl font-bold font-mono text-good mt-1">4.21% <span className="text-xs font-normal text-ink-muted">error</span></div>
                <div className="text-[10px] text-good font-mono mt-0.5">Beats 3 contenders</div>
              </div>
            </div>

            {/* SVG Visual Chart Simulation */}
            <div className="rounded-lg bg-canvas border border-border p-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <Activity className="h-4 w-4 text-signal" />
                    <span>Historical Actuals vs Champion Forecast Line</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-actual">
                    <span className="h-2 w-2 rounded-full bg-actual" /> Actuals
                  </div>
                  <div className="flex items-center gap-1.5 text-signal">
                    <span className="h-2 w-2 rounded-full bg-signal" /> Champion Forecast
                  </div>
                  <div className="flex items-center gap-1.5 text-signal/60 hidden sm:flex">
                    <span className="h-2 w-4 bg-signal/20 rounded" /> 80% / 95% Confidence Band
                  </div>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="h-44 sm:h-56 w-full pt-3">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5A623" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F5A623" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="#232A34" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#232A34" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#232A34" strokeDasharray="3 3" />

                  {/* Cutoff vertical line (History vs Forecast) */}
                  <line x1="440" y1="10" x2="440" y2="170" stroke="#5B6472" strokeDasharray="4 4" />
                  <text x="445" y="24" fill="#8A93A1" fontSize="10" fontFamily="monospace">Forecast Horizon →</text>

                  {/* Actuals area & line */}
                  <path
                    d="M 20 120 Q 80 130 120 110 T 220 95 T 320 125 T 440 85 L 440 170 L 20 170 Z"
                    fill="url(#actualGrad)"
                  />
                  <path
                    d="M 20 120 Q 80 130 120 110 T 220 95 T 320 125 T 440 85"
                    fill="none"
                    stroke="#4FD1C5"
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
                    stroke="#F5A623"
                    strokeWidth="3"
                  />

                  {/* Key nodes */}
                  <circle cx="440" cy="85" r="4" fill="#E8EAED" stroke="#0C0F13" strokeWidth="2" />
                  <circle cx="600" cy="68" r="4" fill="#F5A623" stroke="#0C0F13" strokeWidth="2" />
                  <circle cx="780" cy="55" r="4" fill="#F5A623" stroke="#0C0F13" strokeWidth="2" />
                </svg>
              </div>

              {/* Bottom Copilot Callout Strip */}
              <div className="mt-3 flex items-center justify-between rounded bg-surface-raised/70 border border-border-soft px-3 py-2 text-xs">
                <div className="flex items-center gap-2 text-ink">
                  <Sparkles className="h-4 w-4 text-signal shrink-0" />
                  <span className="text-[11px] text-ink-muted">
                    <strong className="text-ink">AI Copilot Analysis:</strong> "Model detected a 14% seasonal uplift entering Week 42. Auto-ARIMA was selected with lowest WAPE (4.21%). Recommend ordering 340 units buffer by Oct 28."
                  </span>
                </div>
                <button
                  onClick={handleGuestDemo}
                  className="shrink-0 text-[11px] font-mono text-signal hover:underline flex items-center gap-1"
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
