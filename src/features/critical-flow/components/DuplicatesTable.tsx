"use client";

import { Copy } from "lucide-react";
import type { InsightsResult } from "../types";
import ExportCsvButton from "@/components/ui/ExportCsvButton";
import type { CsvColumn } from "@/lib/csv";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
  csvPrefix?: string;
}

const CSV_COLUMNS: CsvColumn<InsightsResult["duplicates"][number]>[] = [
  { header: "Title", value: (r) => r.title },
  { header: "Divisions", value: (r) => r.divisions.join(", ") },
  { header: "Writers", value: (r) => r.writers.join(", ") },
  { header: "Copies", value: (r) => r.count },
];

/**
 * Same headline allotted more than once. Within a division that usually means a
 * duplicate allotment; across divisions it is often deliberate (two feeds
 * covering one story), so the division list matters more than the count.
 */
export default function DuplicatesTable({ data, isLoading, csvPrefix = "critical-flow" }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <Copy size={14} className="text-indigo-500" />
            Repeated Titles
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Matched on the headline with punctuation and quote styles stripped
          </p>
        </div>
        <ExportCsvButton rows={data.duplicates} columns={CSV_COLUMNS} filename={`${csvPrefix}-repeated-titles`} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Divisions</th>
              <th className="px-3 py-2 text-left font-medium">Writers</th>
              <th className="px-3 py-2 text-right font-medium">Copies</th>
            </tr>
          </thead>
          <tbody>
            {data.duplicates.map((d) => {
              const crossDivision = d.divisions.length > 1;
              return (
                <tr
                  key={d.titleNorm}
                  className="border-b border-gray-50 last:border-0 dark:border-gray-800/50"
                >
                  <td className="max-w-[380px] px-3 py-2">
                    <span className="block truncate text-gray-700 dark:text-gray-300" title={d.title}>
                      {d.title}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        crossDivision
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      }`}
                      title={
                        crossDivision
                          ? "Different divisions covering the same story"
                          : "Allotted more than once inside one division"
                      }
                    >
                      {d.divisions.join(", ")}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-gray-500 dark:text-gray-400">
                    {d.writers.join(", ")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-white">
                    {d.count}
                  </td>
                </tr>
              );
            })}
            {data.duplicates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                  No repeated titles in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
