"use client";

import type { StageDurationResult } from "../types";
import { fmtHours } from "../format";

interface Props {
  data?: StageDurationResult;
  isLoading: boolean;
}

export default function FeedDurations({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const feeds = data.byFeed.slice(0, 12);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Cycle Time by Feed
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Median stage durations for the busiest feeds
        </p>
      </div>

      {feeds.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800/60 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 text-right font-medium">Pieces</th>
                <th className="px-3 py-2 text-right font-medium">Pick</th>
                <th className="px-3 py-2 text-right font-medium">Write</th>
                <th className="px-3 py-2 text-right font-medium">Review</th>
                <th className="px-3 py-2 text-right font-medium">Publish</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {feeds.map((f) => (
                <tr key={f.name}>
                  <td className="max-w-[200px] truncate px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {f.name}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {f.count}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.pickLatencyHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.writingHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.editingHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.publishHours)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                    {fmtHours(f.totalHours)}
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
