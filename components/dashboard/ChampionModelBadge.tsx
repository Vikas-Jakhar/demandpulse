import { BadgeCheck, ChevronRight } from "lucide-react";

interface ChampionModelBadgeProps {
  championDisplayName: string;
  forecastReliabilityPct: number;
  onViewDiagnostics: () => void;
}

/**
 * Deliberately small and quiet — a single line of metadata, not a panel.
 * This is the ONLY place the champion's model name appears on the main
 * dashboard, and the only entry point into the diagnostics drawer. A
 * business user can ignore it entirely; a data engineer knows exactly where
 * to click.
 */
export function ChampionModelBadge({
  championDisplayName,
  forecastReliabilityPct,
  onViewDiagnostics,
}: ChampionModelBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
      <BadgeCheck className="h-3.5 w-3.5 text-signal" />
      <span>
        Optimal Model: <span className="text-ink-muted">{championDisplayName}</span>
      </span>
      <span className="text-border">•</span>
      <span>
        Backtested Accuracy: <span className="text-ink-muted">{forecastReliabilityPct}%</span>
      </span>
      <button
        onClick={onViewDiagnostics}
        className="ml-1 flex items-center gap-0.5 text-ink-faint underline decoration-dotted underline-offset-2 hover:text-signal"
      >
        View Audit & Diagnostics
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
