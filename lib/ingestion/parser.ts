import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { RawRow } from "@/types";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export interface ParseResult {
  rows: RawRow[];
  fileName: string;
  rowCount: number;
  columnCount: number;
}

export class FileValidationError extends Error {}

export function validateFile(file: File): void {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new FileValidationError(
      `Unsupported file type "${ext}". Upload a .csv, .xlsx, or .xls file.`
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileValidationError(
      `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 50MB limit.`
    );
  }
  if (file.size === 0) {
    throw new FileValidationError("File is empty.");
  }
}

/** Parses a CSV file client-side (or server-side, given a Buffer/text) via PapaParse. */
export function parseCsv(input: File | string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(input as File, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const fatal = results.errors.filter((e) => e.type !== "FieldMismatch");
          if (fatal.length > 0) {
            reject(new FileValidationError(`CSV parse error: ${fatal[0].message}`));
            return;
          }
        }
        const rows = results.data.filter((r) => Object.keys(r).length > 0);
        resolve({
          rows,
          fileName: input instanceof File ? input.name : "pasted-data.csv",
          rowCount: rows.length,
          columnCount: rows[0] ? Object.keys(rows[0]).length : 0,
        });
      },
      error: (err: Error) => reject(new FileValidationError(err.message)),
    });
  });
}

/** Parses an Excel workbook (first sheet) into row objects via SheetJS. */
export async function parseExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new FileValidationError("Workbook contains no sheets.");
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null, raw: true });

  return {
    rows,
    fileName: file.name,
    rowCount: rows.length,
    columnCount: rows[0] ? Object.keys(rows[0]).length : 0,
  };
}

/** Single entry point: validates and routes to the correct parser by extension. */
export async function parseUploadedFile(file: File): Promise<ParseResult> {
  validateFile(file);
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (ext === ".csv") return parseCsv(file);
  return parseExcel(file);
}
