"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

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

  const handleSelectPreset = (p: PresetData) => {
    setActivePresetId(p.id);
    setLeadTimeDays(p.defaultLeadDays);
    setServiceLevel(p.defaultServiceLevel);
  };

  const zScore = useMemo(() => {
    const sl = serviceLevel / 100;
    if (sl >= 0.995) return 2.576;
    if (sl >= 0.99) return 2.326;
    if (sl >= 0.98) return 2.054;
    if (sl >= 0.95) return 1.645;
    if (sl >= 0.90) return 1.282;
    return 1.0;
  }, [serviceLevel]);

  const safetyStock = useMemo(() => {
    return Math.round(zScore * Math.sqrt(leadTimeDays) * selectedPreset.dailyStd);
  }, [zScore, leadTimeDays, selectedPreset.dailyStd]);

  const leadTimeDemand = useMemo(() => {
    return Math.round(selectedPreset.dailyMean * leadTimeDays);
  }, [selectedPreset.dailyMean, leadTimeDays]);

  const reorderPoint = useMemo(() => {
    return leadTimeDemand + safetyStock;
  }, [leadTimeDemand, safetyStock]);

  const stockoutRisk = useMemo(() => {
    return Math.max(0.1, +(100 - serviceLevel).toFixed(1));
  }, [serviceLevel]);

  return (
    <section id="sandbox" className="relative py-24 bg-[#151518] border-t border-[#26262E]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[300px] bg-[#FF6A00]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#0B0B0D] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold mb-4 shadow-[0_0_12px_rgba(255,106,0,0.15)]">
            <Sliders className="h-3.5 w-3.5" />
            <span>INTERACTIVE CONTROL SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Test the Real-Time Inventory & Forecasting Engine
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0]">
            Drag the sliders below to see how changes in supplier lead time and required cycle service
            level dynamically recalculate safety stock buffers and reorder points in real time.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          {presets.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#0B0B0D] border-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/20"
                    : "bg-[#1C1C22] border-[#26262E] text-[#94A3B8] hover:text-white hover:border-[#FF6A00]/40"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isSelected ? "bg-[#FF6A00] shadow-[0_0_8px_#FF6A00]" : "bg-[#94A3B8]/40"}`}
                />
                <span className="font-semibold">{preset.name}</span>
                <span className="text-[10px] text-[#94A3B8] font-mono hidden sm:inline">
                  ({preset.category})
                </span>
              </button>
            );
          })}
        </div>

        {/* Simulator Box */}
        <div className="mt-8 rounded-2xl border border-[#26262E] bg-[#0B0B0D] shadow-2xl shadow-black/80 overflow-hidden">
          {/* Simulator Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-[#1C1C22] border-b border-[#26262E] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6A00] font-bold">SIMULATION ACTIVE</span>
              <span className="text-[#26262E]">|</span>
              <span className="text-white">Champion: {selectedPreset.championModel}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#10B981] font-semibold">WAPE: {selectedPreset.wape}%</span>
              <span className="text-[#26262E]">|</span>
              <button
                onClick={() => {
                  setLeadTimeDays(selectedPreset.defaultLeadDays);
                  setServiceLevel(selectedPreset.defaultServiceLevel);
                }}
                className="flex items-center gap-1 text-[#94A3B8] hover:text-[#FF6A00] transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls (Sliders) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Slider 1: Service Level */}
              <div className="p-4 rounded-xl bg-[#151518] border border-[#26262E] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#FF6A00]" />
                    <span>Target Cycle Service Level</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-[#FF6A00]">
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
                  className="w-full accent-[#FF6A00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                  <span>90% (Low Buffer)</span>
                  <span>Z = {zScore.toFixed(3)}</span>
                  <span>99.5% (Zero Stockout)</span>
                </div>
              </div>

              {/* Slider 2: Supplier Lead Time */}
              <div className="p-4 rounded-xl bg-[#151518] border border-[#26262E] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-[#38BDF8]" />
                    <span>Supplier Lead Time</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-[#38BDF8]">
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
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                  <span>5 Days (Local)</span>
                  <span>Transit Variance √L = {Math.sqrt(leadTimeDays).toFixed(2)}</span>
                  <span>35 Days (Overseas)</span>
                </div>
              </div>

              {/* Mathematical formula badge */}
              <div className="p-3.5 rounded-lg bg-[#1C1C22] border border-[#26262E] text-[11px] font-mono text-[#E2E8F0] space-y-1">
                <div className="text-white font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#FF6A00]" /> Mathematical Model Formulation:
                </div>
                <div className="text-[#94A3B8] pl-1">
                  Safety Stock = Z ({zScore.toFixed(2)}) × √Lead ({Math.sqrt(leadTimeDays).toFixed(2)}) × σ ({selectedPreset.dailyStd})
                </div>
                <div className="text-[#FF6A00] font-bold pl-1">
                  = {safetyStock.toLocaleString()} units
                </div>
              </div>
            </div>

            {/* Right Display (Visual Inventory Architecture) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Computed Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-[#151518] border border-[#26262E]">
                  <div className="text-[10px] text-[#94A3B8] font-mono uppercase">Safety Buffer</div>
                  <div className="text-2xl font-black font-mono text-[#10B981] mt-1">
                    +{safetyStock.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                    Absorbs demand spikes
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#151518] border border-[#26262E]">
                  <div className="text-[10px] text-[#94A3B8] font-mono uppercase">Reorder Point (ROP)</div>
                  <div className="text-2xl font-black font-mono text-[#FF9D2E] mt-1">
                    {reorderPoint.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                    Order when stock hits this
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#151518] border border-[#26262E] col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#94A3B8] font-mono uppercase">Stockout Risk</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {stockoutRisk}%
                  </div>
                  <div className="text-[10px] text-[#10B981] font-mono mt-0.5">
                    Protected by {serviceLevel}% SL
                  </div>
                </div>
              </div>

              {/* Dynamic Visual Breakdown Bar */}
              <div className="p-4 rounded-xl bg-[#151518] border border-[#26262E] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Total Reorder Inventory Breakdown</span>
                  <span className="font-mono text-[#94A3B8] text-[11px]">
                    Total ROP: {reorderPoint.toLocaleString()} units
                  </span>
                </div>

                {/* Stacked bar visualization */}
                <div className="w-full h-8 rounded-md bg-[#0B0B0D] border border-[#26262E] overflow-hidden flex text-[10px] font-mono font-bold">
                  <div
                    className="bg-[#38BDF8] text-[#0B0B0D] flex items-center justify-center transition-all duration-300 font-extrabold"
                    style={{
                      width: `${(leadTimeDemand / reorderPoint) * 100}%`,
                    }}
                    title={`Lead Time Expected Demand: ${leadTimeDemand} units`}
                  >
                    Expected Demand ({Math.round((leadTimeDemand / reorderPoint) * 100)}%)
                  </div>
                  <div
                    className="bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white flex items-center justify-center transition-all duration-300 font-extrabold shadow-sm"
                    style={{
                      width: `${(safetyStock / reorderPoint) * 100}%`,
                    }}
                    title={`Safety Stock Buffer: ${safetyStock} units`}
                  >
                    Safety Buffer ({Math.round((safetyStock / reorderPoint) * 100)}%)
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#E2E8F0] font-mono">
                  <div className="flex items-center gap-1.5 text-[#38BDF8]">
                    <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> Lead Time Demand: {leadTimeDemand.toLocaleString()} u
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FF6A00]">
                    <span className="h-2 w-2 rounded-full bg-[#FF6A00]" /> Safety Buffer: +{safetyStock.toLocaleString()} u
                  </div>
                </div>
              </div>

              {/* Copilot insight for this state */}
              <div className="p-3.5 rounded-lg bg-[#1C1C22] border border-[#FF6A00]/40 flex items-center justify-between shadow-[0_0_15px_rgba(255,106,0,0.1)]">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#FF6A00] shrink-0" />
                  <p className="text-xs text-white">
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
