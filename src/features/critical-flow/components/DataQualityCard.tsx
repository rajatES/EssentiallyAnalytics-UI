"use client";

import { FileWarning } from "lucide-react";
import type { InsightsResult } from "../types";
import { fmtInt } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

/**
 * Gaps in the source sheets that limit what the rest of the dashboard can say.
 * Surfaced rather than silently absorbed, because every one of these is fixable
 * at the source and each fix unlocks a metric.
 */
export default function DataQualityCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-56 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <FileWarning size={14} className="text-amber-500" />
        Source Data Gaps
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Missing cells in the division sheets, and what each one costs
      </p>

      <div className="space-y-2">
        {data.dataQuality.map((d) => (
          <div
            key={d.issue}
            className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/30"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {d.issue}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                {d.detail}
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold tabular-nums text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              {fmtInt(d.count)}
            </span>
          </div>
        ))}
        {data.dataQuality.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">
            No gaps detected — every piece has the fields the dashboard needs
          </p>
        )}
      </div>
    </div>
  );
}
