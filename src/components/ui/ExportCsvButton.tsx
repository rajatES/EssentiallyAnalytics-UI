"use client";

import { Download } from "lucide-react";
import { toCsv, csvFilename, downloadCsv, type CsvColumn } from "@/lib/csv";

interface Props<T> {
  /** Rows in the order the table is currently showing them. */
  rows: T[];
  columns: CsvColumn<T>[];
  /** Filename stem; the date is appended. */
  filename: string;
}

/**
 * Downloads a table as CSV. Exports every row the table holds, which for the
 * capped tables is more than is on screen — the file is for working through
 * elsewhere, so truncating it to the preview would defeat the point.
 */
export default function ExportCsvButton<T>({ rows, columns, filename }: Props<T>) {
  const disabled = !rows.length;
  return (
    <button
      type="button"
      onClick={() => downloadCsv(csvFilename(filename), toCsv(rows, columns))}
      disabled={disabled}
      title={disabled ? "Nothing to export" : `Download ${rows.length} rows as CSV`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
    >
      <Download size={12} />
      CSV
    </button>
  );
}
