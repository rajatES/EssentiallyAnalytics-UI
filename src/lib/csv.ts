/**
 * CSV export for the dashboard tables.
 *
 * Written for Excel, which is where these files actually get opened: a UTF-8
 * BOM so curly quotes and em dashes in headlines survive, CRLF line endings,
 * and every field quoted so commas inside titles cannot shift a column.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/**
 * Excel treats a leading =, + or @ as the start of a formula, so a title like
 * "=Best XI" would execute rather than display. Prefixing an apostrophe makes
 * the cell literal text. A leading minus is left alone — that is just a
 * negative number.
 */
function defuse(text: string): string {
  return /^[=+@]/.test(text) ? `'${text}` : text;
}

function field(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '""';
  const text = typeof v === "number" ? String(v) : defuse(v);
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((c) => field(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => field(c.value(row))).join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** `writers` → `writers-2026-09-23.csv`, so repeated exports do not collide. */
export function csvFilename(base: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${base}-${stamp}.csv`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Freed on the next tick; revoking immediately can cancel the download in
  // some browsers before it has read the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
