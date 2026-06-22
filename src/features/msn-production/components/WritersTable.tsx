"use client";

import { useMemo } from "react";
import type { WriterStats, StageDurationResult } from "../types";
import { fmtHours, fmtPct } from "../format";

interface Props {
  writers?: WriterStats[];
  durations?: StageDurationResult;
  isLoading: boolean;
}

export default function WritersTable({ writers, durations, isLoading }: Props) {
  const writeTimes = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of durations?.byWriter ?? []) map.set(w.name, w.writingHours);
    return map;
  }, [durations]);

  if (isLoading || !writers) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Writers
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Output and speed in the selected period · by pick date
        </p>
      </div>

      {writers.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="max-h-[460px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Writer</th>
                <th className="px-3 py-2 text-right font-medium">Pieces</th>
                <th className="px-3 py-2 text-right font-medium">Published</th>
                <th className="px-3 py-2 text-right font-medium">Rate</th>
                <th className="px-3 py-2 text-right font-medium">Write time</th>
                <th className="px-3 py-2 text-right font-medium">Sent back</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {writers.map((w) => (
                <tr key={w.writer}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {w.writer}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.total}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.published}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtPct(w.publishRate)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(writeTimes.get(w.writer))}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      w.sentBackRate > 0
                        ? "font-medium text-rose-600 dark:text-rose-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {w.sentBackRate > 0 ? fmtPct(w.sentBackRate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
