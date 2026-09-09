"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  seriesKeys: string[];
  activeSeriesKey: string;
  onSeriesChange: (key: string) => void;
  horizon: number;
  onHorizonChange: (h: number) => void;
  band: "80" | "95" | "none";
  onBandChange: (b: "80" | "95" | "none") => void;
  onExport: () => void;
}

const HORIZON_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "12 weeks", value: 84 },
  { label: "12 months", value: 365 },
];

export function FilterBar({
  seriesKeys,
  activeSeriesKey,
  onSeriesChange,
  horizon,
  onHorizonChange,
  band,
  onBandChange,
  onExport,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3">
      <FilterSelect label="SKU / Category" value={activeSeriesKey} options={seriesKeys} onChange={onSeriesChange} />
      <FilterSelect
        label="Horizon"
        value={String(horizon)}
        options={HORIZON_OPTIONS.map((h) => String(h.value))}
        labels={HORIZON_OPTIONS.map((h) => h.label)}
        onChange={(v) => onHorizonChange(Number(v))}
      />
      <FilterSelect
        label="Confidence band"
        value={band}
        options={["80", "95", "none"]}
        labels={["80%", "95%", "Off"]}
        onChange={(v) => onBandChange(v as "80" | "95" | "none")}
      />
      <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={onExport}>
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded border border-border bg-surface-raised px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {labels?.[i] ?? opt}
          </option>
        ))}
      </select>
    </label>
  );
}
