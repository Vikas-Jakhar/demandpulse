import { TrendingUp, ShieldCheck, DollarSign, PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent, cn } from "@/lib/utils";
import type { SafetyStockResult } from "@/types";

interface KPICardsProps {
  totalPredictedDemand: number;
  forecastReliabilityPct: number;
  estimatedRevenueImpact: number;
  safetyStock: SafetyStockResult;
}

/**
 * Champion Model rule applied to the KPI row: no raw ML terminology here.
 * "Forecast Reliability" replaces a bare MAPE/accuracy number — the
 * underlying metric (backtested 1 - WAPE) is unchanged, only the label a
 * business user sees is different. Anyone who wants the raw metric names
 * gets them in the diagnostics drawer, not here.
 */
export function KPICards({
  totalPredictedDemand,
  forecastReliabilityPct,
  estimatedRevenueImpact,
  safetyStock,
}: KPICardsProps) {
  const cards = [
    {
      label: "Total predicted demand",
      value: formatNumber(totalPredictedDemand),
      icon: TrendingUp,
      accent: "text-forecast",
    },
    {
      label: "Forecast reliability",
      value: formatPercent(forecastReliabilityPct),
      icon: ShieldCheck,
      accent:
        forecastReliabilityPct >= 85 ? "text-good" : forecastReliabilityPct >= 70 ? "text-warn" : "text-bad",
      sub: "Backtested against held-out history",
    },
    {
      label: "Est. revenue impact",
      value: formatCurrency(estimatedRevenueImpact),
      icon: DollarSign,
      accent: "text-actual",
    },
    {
      label: "Recommended safety stock",
      value: formatNumber(safetyStock.safetyStock),
      icon: PackageCheck,
      accent: "text-signal",
      sub: `Reorder at ${formatNumber(safetyStock.reorderPoint)} units`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start justify-between p-4">
            <div>
              <p className="text-xs text-ink-muted">{card.label}</p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{card.value}</p>
              {card.sub && <p className="mt-0.5 text-xs text-ink-faint">{card.sub}</p>}
            </div>
            <card.icon className={cn("h-5 w-5 shrink-0", card.accent)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
