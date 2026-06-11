"use client";

import { ArrowRight } from "lucide-react";
import type { InsightsResult } from "../types";
import { fmtHours } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

export default function PairMatrix({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const pairs = data.pairMatrix;
  const reviewTimes = pairs
    .map((p) => p.medianReviewHours)
    .filter((h) => h > 0)
    .sort((a, b) => a - b);
  const slowThreshold = reviewTimes.length
    ? reviewTimes[Math.floor(reviewTimes.length * 0.75)]
    : Infinity;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Writer × Editor Pairings
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Most frequent combos — slow review times and sent-backs flag friction
        </p>
      </div>

      {pairs.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          Not enough paired data (combos need ≥2 pieces)
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Pair</th>
                <th className="px-3 py-2 text-right font-medium">Pieces</th>
                <th className="px-3 py-2 text-right font-medium">Review time</th>
                <th className="px-3 py-2 text-right font-medium">Sent back</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {pairs.map((p) => {
                const slow =
                  p.medianReviewHours > 0 && p.medianReviewHours >= slowThreshold;
                return (
                  <tr key={`${p.writer}|${p.editor}`}>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                        <span className="truncate">{p.writer}</span>
                        <ArrowRight size={10} className="shrink-0 text-gray-300 dark:text-gray-600" />
                        <span className="truncate text-gray-500 dark:text-gray-400">
                          {p.editor}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                      {p.pieces}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${
                        slow
                          ? "font-medium text-amber-600 dark:text-amber-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {fmtHours(p.medianReviewHours)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${
                        p.sentBacks > 0
                          ? "font-medium text-rose-600 dark:text-rose-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {p.sentBacks > 0 ? p.sentBacks : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
