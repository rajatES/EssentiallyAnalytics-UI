"use client";

import { ExternalLink } from "lucide-react";
import type { TatResult } from "../types";
import { csvHours, fmtHours, ageTone, AGE_TONE_CLASS } from "../format";
import ExportCsvButton from "@/components/ui/ExportCsvButton";
import type { CsvColumn } from "@/lib/csv";

interface Props {
  data?: TatResult;
  isLoading: boolean;
  csvPrefix?: string;
}

const CSV_COLUMNS: CsvColumn<TatResult["slowest"][number]>[] = [
  { header: "Title", value: (r) => r.title },
  { header: "Division", value: (r) => r.division },
  { header: "Writer", value: (r) => r.writer },
  { header: "Editor", value: (r) => r.editor },
  { header: "TAT (h)", value: (r) => csvHours(r.tatHours) },
  { header: "Staging Link", value: (r) => r.stagingLink },
];

export default function SlowestTable({ data, isLoading, csvPrefix = "critical-flow" }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Slowest Pieces
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            The longest turnarounds that still completed — worth a look for what held them up
          </p>
        </div>
        <ExportCsvButton rows={data.slowest} columns={CSV_COLUMNS} filename={`${csvPrefix}-slowest-pieces`} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Division</th>
              <th className="px-3 py-2 text-left font-medium">Writer</th>
              <th className="px-3 py-2 text-left font-medium">Editor</th>
              <th className="px-3 py-2 text-right font-medium">TAT</th>
            </tr>
          </thead>
          <tbody>
            {data.slowest.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                <td className="max-w-[400px] px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-gray-700 dark:text-gray-300" title={r.title}>
                      {r.title}
                    </span>
                    {r.stagingLink && (
                      <a
                        href={r.stagingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-300 hover:text-indigo-500 dark:text-gray-600"
                        title="Open staging link"
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.division}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.writer}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.editor}</td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`rounded px-1.5 py-0.5 tabular-nums ${AGE_TONE_CLASS[ageTone(r.tatHours)]}`}
                  >
                    {fmtHours(r.tatHours)}
                  </span>
                </td>
              </tr>
            ))}
            {data.slowest.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                  No completed pieces with a measurable turnaround
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
