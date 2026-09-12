"use client";

import * as React from "react";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, X, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseUploadedFile, FileValidationError, MAX_FILE_SIZE_BYTES } from "@/lib/ingestion/parser";
import { detectColumns, autoMapColumns } from "@/lib/ingestion/column-detector";
import { buildAndCleanSeries } from "@/lib/ingestion/cleaning";
import type { ColumnMapping, CleaningOptions, Dataset, DetectedColumn, RawRow } from "@/types";
import { useAppStore } from "@/lib/store/useAppStore";

type Stage = "idle" | "parsing" | "mapping" | "cleaning" | "saving" | "done" | "error";

const DEFAULT_CLEANING: CleaningOptions = {
  imputationStrategy: "FORWARD_FILL",
  outlierMethod: "IQR",
  outlierAction: "CAP",
  targetFrequency: "DAILY",
};

interface FileUploadProps {
  /** Guest sessions can preview an upload locally but can't persist it — see /api/datasets. */
  isGuest?: boolean;
}

export function FileUpload({ isGuest = false }: FileUploadProps) {
  const [stage, setStage] = React.useState<Stage>("idle");
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [rawRows, setRawRows] = React.useState<RawRow[]>([]);
  const [detected, setDetected] = React.useState<DetectedColumn[]>([]);
  const [mapping, setMapping] = React.useState<ColumnMapping | null>(null);
  const [cleaningOptions, setCleaningOptions] = React.useState<CleaningOptions>(DEFAULT_CLEANING);
  const [fileName, setFileName] = React.useState<string>("");
  const [wasPersisted, setWasPersisted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const setDataset = useAppStore((s) => s.setDataset);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setStage("parsing");
    setFileName(file.name);
    try {
      const result = await parseUploadedFile(file);
      if (result.rowCount === 0) {
        throw new FileValidationError("No data rows found in this file.");
      }
      const cols = detectColumns(result.rows);
      const guess = autoMapColumns(cols);
      setRawRows(result.rows);
      setDetected(cols);
      setMapping(guess);
      setStage("mapping");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to parse file.");
      setStage("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirmMapping = async () => {
    if (!mapping) return;
    setStage("cleaning");

    let cleaned: ReturnType<typeof buildAndCleanSeries>;
    try {
      cleaned = buildAndCleanSeries(rawRows, mapping, cleaningOptions);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to clean dataset.");
      setStage("error");
      return;
    }

    const { series, report } = cleaned;
    const seriesKeys = [...new Set(series.map((s) => s.seriesKey))];
    const localDataset: Dataset = {
      id: crypto.randomUUID(),
      name: fileName,
      uploadedAt: new Date().toISOString(),
      frequency: cleaningOptions.targetFrequency,
      columnMapping: mapping,
      cleaningReport: report,
      series,
      seriesKeys,
    };

    // Guests preview locally only — there's no User row to attach a saved
    // Dataset to (see the comment in app/api/auth/guest/route.ts), so
    // skipping straight to the in-memory dataset is correct here, not a
    // shortcut around a bug.
    if (isGuest) {
      setDataset(localDataset);
      setWasPersisted(false);
      setStage("done");
      return;
    }

    setStage("saving");
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName,
          fileName,
          columnMapping: mapping,
          cleaningReport: report,
          frequency: cleaningOptions.targetFrequency,
          series,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save dataset.");
      }

      const { dataset: saved } = await res.json();
      // Swap in the server-issued id so this dataset is addressable via
      // /api/datasets/[id] later (history views, forecast persistence) —
      // everything else about the local object is already correct, so
      // there's no need to re-fetch the rows we just uploaded.
      setDataset({ ...localDataset, id: saved.id });
      setWasPersisted(true);
      setStage("done");
    } catch (err) {
      // The clean succeeded even though the save didn't — let the user keep
      // working with it locally rather than losing the upload entirely.
      setDataset(localDataset);
      setWasPersisted(false);
      setErrorMessage(
        err instanceof Error
          ? `Dataset is loaded but couldn't be saved: ${err.message}`
          : "Dataset is loaded but couldn't be saved."
      );
      setStage("done");
    }
  };

  const reset = () => {
    setStage("idle");
    setErrorMessage(null);
    setRawRows([]);
    setDetected([]);
    setMapping(null);
    setFileName("");
    setWasPersisted(false);
  };

  if (stage === "idle" || stage === "error") {
    return (
      <Card>
        <CardContent className="p-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-12 text-center transition-colors",
              isDragging ? "border-signal bg-signal/5" : "border-border-soft hover:border-ink-faint"
            )}
          >
            <UploadCloud className={cn("h-10 w-10", isDragging ? "text-signal" : "text-ink-faint")} />
            <div>
              <p className="text-sm font-medium text-ink">Drop your demand history here</p>
              <p className="mt-1 text-xs text-ink-muted">
                .csv, .xlsx, or .xls — up to {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              Browse files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
          {isGuest && (
            <div className="flex items-center gap-2 border-t border-border-soft p-3 text-xs text-ink-faint">
              <CloudOff className="h-3.5 w-3.5 shrink-0" />
              Guest sessions preview uploads but don't save them — sign up to keep your data.
            </div>
          )}
          {stage === "error" && errorMessage && (
            <div className="flex items-center gap-2 border-t border-border p-3 text-sm text-bad">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
              <button onClick={reset} className="ml-auto text-ink-faint hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (stage === "parsing" || stage === "cleaning" || stage === "saving") {
    const label =
      stage === "parsing"
        ? `Parsing ${fileName}…`
        : stage === "cleaning"
        ? "Cleaning and resampling…"
        : "Saving to your account…";
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-faint border-t-signal" />
          <span className="text-sm text-ink-muted">{label}</span>
        </CardContent>
      </Card>
    );
  }

  if (stage === "mapping" && mapping) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-actual" />
            <span className="text-sm font-medium text-ink">{fileName}</span>
            <span className="text-xs text-ink-faint">{rawRows.length} rows detected</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MappingSelect
              label="Date column"
              value={mapping.dateColumn}
              options={detected.map((d) => d.name)}
              onChange={(v) => setMapping({ ...mapping, dateColumn: v })}
            />
            <MappingSelect
              label="Demand / target column"
              value={mapping.targetColumn}
              options={detected.map((d) => d.name)}
              onChange={(v) => setMapping({ ...mapping, targetColumn: v })}
            />
            <MappingSelect
              label="SKU / series column (optional)"
              value={mapping.seriesKeyColumn}
              options={detected.map((d) => d.name)}
              allowNone
              onChange={(v) => setMapping({ ...mapping, seriesKeyColumn: v })}
            />
            <MappingSelect
              label="Resample to"
              value={cleaningOptions.targetFrequency}
              options={["DAILY", "WEEKLY", "MONTHLY"]}
              onChange={(v) =>
                setCleaningOptions({ ...cleaningOptions, targetFrequency: v as CleaningOptions["targetFrequency"] })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border-soft pt-4">
            <MappingSelect
              label="Missing-value strategy"
              value={cleaningOptions.imputationStrategy}
              options={["FORWARD_FILL", "MEAN", "MEDIAN", "NONE"]}
              onChange={(v) =>
                setCleaningOptions({ ...cleaningOptions, imputationStrategy: v as CleaningOptions["imputationStrategy"] })
              }
            />
            <MappingSelect
              label="Outlier detection"
              value={cleaningOptions.outlierMethod}
              options={["IQR", "ZSCORE", "NONE"]}
              onChange={(v) =>
                setCleaningOptions({ ...cleaningOptions, outlierMethod: v as CleaningOptions["outlierMethod"] })
              }
            />
          </div>

          <div className="flex items-center justify-between border-t border-border-soft pt-4">
            <button onClick={reset} className="text-xs text-ink-faint hover:text-ink">
              Cancel
            </button>
            <Button
              size="sm"
              variant="signal"
              disabled={!mapping.dateColumn || !mapping.targetColumn}
              onClick={handleConfirmMapping}
            >
              Confirm & process
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-good" />
        <div>
          <p className="text-sm font-medium text-ink">{fileName} processed successfully</p>
          <p className="text-xs text-ink-muted">
            {wasPersisted
              ? "Saved to your account — view it on the dashboard below."
              : errorMessage ?? "Loaded for this session only — view it on the dashboard below."}
          </p>
        </div>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={reset}>
          Upload another
        </Button>
      </CardContent>
    </Card>
  );
}

function MappingSelect({
  label,
  value,
  options,
  onChange,
  allowNone,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
  allowNone?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="h-8 rounded border border-border bg-surface-raised px-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
      >
        {allowNone && <option value="">None</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
