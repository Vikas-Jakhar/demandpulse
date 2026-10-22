"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PresetData {
  id: string;
  name: string;
  category: string;
  dailyMean: number;
  dailyStd: number;
  defaultLeadDays: number;
  defaultServiceLevel: number;
  championModel: string;
  wape: number;
}

export function InteractiveSandbox() {
  const presets: PresetData[] = [
    {
      id: "electronics",
      name: "Wireless Audio Controller (IND-804)",
      category: "Consumer Hardware",
      dailyMean: 145,
      dailyStd: 38,
      defaultLeadDays: 14,
      defaultServiceLevel: 95.0,
      championModel: "Auto-ARIMA (p=1,d=1,q=2)",
      wape: 4.1,
    },
    {
      id: "pharma",
      name: "Sterile Infusion Kits (MED-902)",
      category: "Healthcare & Pharma",
      dailyMean: 310,
      dailyStd: 45,
      defaultLeadDays: 7,
      defaultServiceLevel: 99.5,
      championModel: "Holt-Winters Exp. Smoothing",
      wape: 3.2,
    },
    {
      id: "apparel",
      name: "Technical Storm Parka (APP-310)",
      category: "Outdoor Apparel",
      dailyMean: 82,
      dailyStd: 29,
      defaultLeadDays: 21,
      defaultServiceLevel: 92.0,
      championModel: "Prophet Seasonal Trend",
      wape: 6.4,
    },
  ];

  const [activePresetId, setActivePresetId] = useState<string>("electronics");
  const selectedPreset = presets.find((p) => p.id === activePresetId) || presets[0];

  const [leadTimeDays, setLeadTimeDays] = useState<number>(selectedPreset.defaultLeadDays);
  const [serviceLevel, setServiceLevel] = useState<number>(selectedPreset.defaultServiceLevel);

  // When switching presets, reset to defaults
  const handleSelectPreset = (p: PresetData) => {
    setActivePresetId(p.id);
    setLeadTimeDays(p.defaultLeadDays);
    setServiceLevel(p.defaultServiceLevel);
  };

  // Convert Service Level % into approximate standard normal Z-score
  // Approximation for z-score of common service levels
  const zScore = useMemo(() => {
    const sl = serviceLevel / 100;
    if (sl >= 0.995) return 2.576;
    if (sl >= 0.99) return 2.326;
    if (sl >= 0.98) return 2.054;
    if (sl >= 0.95) return 1.645;
    if (sl >= 0.90) return 1.282;
    return 1.0;
  }, [serviceLevel]);

  // Compute dynamic inventory metrics
  const safetyStock = useMemo(() => {
    // SS = Z * sqrt(LeadTime) * std_dev
    return Math.round(zScore * Math.sqrt(leadTimeDays) * selectedPreset.dailyStd);
  }, [zScore, leadTimeDays, selectedPreset.dailyStd]);

  const leadTimeDemand = useMemo(() => {
    return Math.round(selectedPreset.dailyMean * leadTimeDays);
  }, [selectedPreset.dailyMean, leadTimeDays]);

  const reorderPoint = useMemo(() => {
    return leadTimeDemand + safetyStock;
  }, [leadTimeDemand, safetyStock]);

  const monthlyForecast = useMemo(() => {
    return Math.round(selectedPreset.dailyMean * 30);
  }, [selectedPreset.dailyMean]);

  const stockoutRisk = useMemo(() => {
    return Math.max(0.1, +(100 - serviceLevel).toFixed(1));
  }, [serviceLevel]);

  return (
    <section id="sandbox" className="relative py-24 bg-surface border-t border-border">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[300px] bg-signal/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-signal font-mono font-medium mb-4">
            <Sliders className="h-3.5 w-3.5" />
            <span>INTERACTIVE CONTROL SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Test the Real-Time Inventory & Forecasting Engine
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted">
            Drag the sliders below to see how changes in supplier lead time and required cycle service
            level dynamically recalculate safety stock buffers and reorder points in real time.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {presets.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-canvas border-signal text-ink shadow-md shadow-signal/10"
                    : "bg-surface-raised border-border/70 text-ink-muted hover:text-ink hover:border-border"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isSelected ? "bg-signal" : "bg-ink-muted/40"}`}
                />
                <span className="font-semibold">{preset.name}</span>
                <span className="text-[10px] text-ink-faint font-mono hidden sm:inline">
                  ({preset.category})
                </span>
              </button>
            );
          })}
        </div>

        {/* Simulator Box */}
        <div className="mt-8 rounded-2xl border border-border bg-canvas shadow-2xl shadow-black/50 overflow-hidden">
          {/* Simulator Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-surface-raised border-b border-border text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-signal font-bold">SIMULATION ACTIVE</span>
              <span className="text-border">|</span>
              <span className="text-ink-muted">Champion: {selectedPreset.championModel}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-good">WAPE: {selectedPreset.wape}%</span>
              <span className="text-border">|</span>
              <button
                onClick={() => {
                  setLeadTimeDays(selectedPreset.defaultLeadDays);
                  setServiceLevel(selectedPreset.defaultServiceLevel);
                }}
                className="flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls (Sliders) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Slider 1: Service Level */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-signal" />
                    <span>Target Cycle Service Level</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-signal">
                    {serviceLevel.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="90.0"
                  max="99.5"
                  step="0.5"
                  value={serviceLevel}
                  onChange={(e) => setServiceLevel(parseFloat(e.target.value))}
                  className="w-full accent-[#F5A623] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-faint font-mono">
                  <span>90% (Low Buffer)</span>
                  <span>Z = {zScore.toFixed(3)}</span>
                  <span>99.5% (Zero Stockout)</span>
                </div>
              </div>

              {/* Slider 2: Supplier Lead Time */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-actual" />
                    <span>Supplier Lead Time</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-actual">
                    {leadTimeDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(parseInt(e.target.value))}
                  className="w-full accent-[#4FD1C5] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-faint font-mono">
                  <span>5 Days (Local)</span>
                  <span>Transit Variance √L = {Math.sqrt(leadTimeDays).toFixed(2)}</span>
                  <span>35 Days (Overseas)</span>
                </div>
              </div>

              {/* Mathematical formula badge */}
              <div className="p-3.5 rounded-lg bg-surface-raised border border-border/80 text-[11px] font-mono text-ink-muted space-y-1">
                <div className="text-ink font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-signal" /> Mathematical Model Formulation:
                </div>
                <div className="text-ink-faint pl-1">
                  Safety Stock = Z ({zScore.toFixed(2)}) × √Lead ({Math.sqrt(leadTimeDays).toFixed(2)}) × σ ({selectedPreset.dailyStd})
                </div>
                <div className="text-signal font-bold pl-1">
                  = {safetyStock.toLocaleString()} units
                </div>
              </div>
            </div>

            {/* Right Display (Visual Inventory Architecture) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Computed Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-surface border border-border">
                  <div className="text-[10px] text-ink-muted font-mono uppercase">Safety Buffer</div>
                  <div className="text-2xl font-bold font-mono text-good mt-1">
                    +{safetyStock.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                    Absorbs demand spikes
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface border border-border">
                  <div className="text-[10px] text-ink-muted font-mono uppercase">Reorder Point (ROP)</div>
                  <div className="text-2xl font-bold font-mono text-warn mt-1">
                    {reorderPoint.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                    Order when inventory hits this
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface border border-border col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-ink-muted font-mono uppercase">Stockout Risk</div>
                  <div className="text-2xl font-bold font-mono text-ink mt-1">
                    {stockoutRisk}%
                  </div>
                  <div className="text-[10px] text-good font-mono mt-0.5">
                    Protected by {serviceLevel}% SL
                  </div>
                </div>
              </div>

              {/* Dynamic Visual Breakdown Bar */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-ink">Total Reorder Inventory Breakdown</span>
                  <span className="font-mono text-ink-muted text-[11px]">
                    Total ROP: {reorderPoint.toLocaleString()} units
                  </span>
                </div>

                {/* Stacked bar visualization */}
                <div className="w-full h-7 rounded-md bg-canvas border border-border overflow-hidden flex text-[10px] font-mono font-bold">
                  <div
                    className="bg-actual/80 text-canvas flex items-center justify-center transition-all duration-300"
                    style={{
                      width: `${(leadTimeDemand / reorderPoint) * 100}%`,
                    }}
                    title={`Lead Time Expected Demand: ${leadTimeDemand} units`}
                  >
                    Expected Demand ({Math.round((leadTimeDemand / reorderPoint) * 100)}%)
                  </div>
                  <div
                    className="bg-signal text-canvas flex items-center justify-center transition-all duration-300"
                    style={{
                      width: `${(safetyStock / reorderPoint) * 100}%`,
                    }}
                    title={`Safety Stock Buffer: ${safetyStock} units`}
                  >
                    Safety Buffer ({Math.round((safetyStock / reorderPoint) * 100)}%)
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-muted font-mono">
                  <div className="flex items-center gap-1.5 text-actual">
                    <span className="h-2 w-2 rounded-full bg-actual" /> Lead Time Demand: {leadTimeDemand.toLocaleString()} u
                  </div>
                  <div className="flex items-center gap-1.5 text-signal">
                    <span className="h-2 w-2 rounded-full bg-signal" /> Safety Buffer: +{safetyStock.toLocaleString()} u
                  </div>
                </div>
              </div>

              {/* Copilot insight for this state */}
              <div className="p-3.5 rounded-lg bg-surface-raised border border-signal/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-signal shrink-0" />
                  <p className="text-xs text-ink">
                    At a <strong>{serviceLevel}% service target</strong> with a <strong>{leadTimeDays}-day supplier turnaround</strong>, maintaining <strong>{safetyStock.toLocaleString()} safety buffer units</strong> keeps stockout probability under <strong>{stockoutRisk}%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
