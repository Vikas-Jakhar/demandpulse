"use client";

import * as React from "react";
import { Database, Trash2, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/useAppStore";
import type { DatasetSummary } from "@/lib/ingestion/persist";
import { formatNumber } from "@/lib/utils";

/**
 * Deliberately minimal: this exists to make Phase 3's persistence actually
 * reachable from the UI (list → load → delete), not to be the dataset
 * management experience described in the Phase 8/9 roadmap item. Sorting,
 * search, pagination, and richer metadata belong there, not here.
 */
export function SavedDatasetsList() {
  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const setDataset = useAppStore((s) => s.setDataset);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/datasets");
      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLoad = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/datasets/${id}`);
      if (!res.ok) return;
      const { dataset } = await res.json();
      setDataset(dataset);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/datasets/${id}`, { method: "DELETE" });
    if (res.ok) setDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-xs text-ink-faint">Loading saved datasets…</CardContent>
      </Card>
    );
  }

  if (datasets.length === 0) {
    return null; // nothing saved yet — don't clutter the uploader with an empty state
  }

  return (
    <Card>
      <CardContent className="space-y-1 p-3">
        <div className="flex items-center gap-1.5 px-1 pb-1 text-xs text-ink-muted">
          <Database className="h-3.5 w-3.5" />
          Saved datasets
        </div>
        {datasets.map((d) => (
          <button
            key={d.id}
            onClick={() => handleLoad(d.id)}
            disabled={loadingId === d.id}
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-ink hover:bg-surface-raised disabled:opacity-50"
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="shrink-0 text-xs text-ink-faint">
              {formatNumber(d.rowCount)} rows · {d.seriesKeys.length} SKU{d.seriesKeys.length === 1 ? "" : "s"}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => handleDelete(d.id, e)}
              className="shrink-0 rounded p-1 text-ink-faint hover:bg-bad/10 hover:text-bad"
              aria-label={`Delete ${d.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
