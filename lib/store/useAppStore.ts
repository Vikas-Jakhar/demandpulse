import { create } from "zustand";
import type { AuthUser, ChampionPayload, Dataset, DiagnosticsPayload } from "@/types";

interface AppState {
  // Auth
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;

  // Active dataset & selection
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
  activeSeriesKey: string | null;
  setActiveSeriesKey: (key: string | null) => void;
  dateRange: { start: string | null; end: string | null };
  setDateRange: (range: { start: string | null; end: string | null }) => void;

  // Champion Model result + scenario controls.
  // `champion` is the ONLY forecast payload the main dashboard renders from.
  // `diagnostics` carries the full benchmark bundle and is read exclusively
  // by the ModelDiagnostics drawer — nothing on the primary dashboard path
  // should ever import from it.
  champion: ChampionPayload | null;
  setChampion: (champion: ChampionPayload | null) => void;
  diagnostics: DiagnosticsPayload | null;
  setDiagnostics: (diagnostics: DiagnosticsPayload | null) => void;
  horizon: number;
  setHorizon: (h: number) => void;
  growthAdjustmentPct: number;
  setGrowthAdjustmentPct: (pct: number) => void;
  isForecasting: boolean;
  setIsForecasting: (v: boolean) => void;

  // Copilot panel
  isCopilotOpen: boolean;
  toggleCopilot: () => void;

  // Model Diagnostics drawer — the sole secondary surface where competing
  // candidates are ever shown, reached only via an explicit user action.
  isDiagnosticsOpen: boolean;
  setDiagnosticsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  dataset: null,
  setDataset: (dataset) =>
    set({
      dataset,
      activeSeriesKey: dataset?.seriesKeys[0] ?? null,
    }),
  activeSeriesKey: null,
  setActiveSeriesKey: (key) => set({ activeSeriesKey: key }),
  dateRange: { start: null, end: null },
  setDateRange: (range) => set({ dateRange: range }),

  champion: null,
  setChampion: (champion) => set({ champion }),
  diagnostics: null,
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  horizon: 30,
  setHorizon: (h) => set({ horizon: h }),
  growthAdjustmentPct: 0,
  setGrowthAdjustmentPct: (pct) => set({ growthAdjustmentPct: pct }),
  isForecasting: false,
  setIsForecasting: (v) => set({ isForecasting: v }),

  isCopilotOpen: false,
  toggleCopilot: () => set((s) => ({ isCopilotOpen: !s.isCopilotOpen })),

  isDiagnosticsOpen: false,
  setDiagnosticsOpen: (open) => set({ isDiagnosticsOpen: open }),
}));
