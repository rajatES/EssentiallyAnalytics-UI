"use client";

import type { TatStat } from "../types";
import { fmtHours, fmtInt } from "../format";

interface Props {
  title: string;
  subtitle: string;
  rows?: TatStat[];
  isLoading: boolean;
  limit?: number;
}

/**
 * Horizontal median bars with a p90 whisker, so a group that is usually fast
 * but occasionally terrible is visibly different from a uniformly slow one.
 */
export default function TatBreakdown({
  title,
  subtitle,
  rows,
  isLoading,
  limit = 12,
}: Props) {
  if (isLoading || !rows) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const visible = rows.slice(0, limit);
  const scale = Math.max(...visible.map((r) => r.p90), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">{subtitle}</p>

      <div className="space-y-2">
        {visible.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span
              className="w-36 shrink-0 truncate text-[11px] text-gray-600 dark:text-gray-300"
              title={r.label}
            >
              {r.label}
            </span>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded bg-indigo-400"
                style={{ width: `${(r.median / scale) * 100}%` }}
              />
              <span
                className="absolute top-0 h-full w-[2px] bg-amber-500"
                style={{ left: `${Math.min((r.p90 / scale) * 100, 99.5)}%` }}
                title={`p90 ${fmtHours(r.p90)}`}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-gray-700 dark:text-gray-300">
              {fmtHours(r.median)}
            </span>
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-gray-400">
              {fmtInt(r.count)}
            </span>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">Not enough data</p>
        )}
      </div>

      {visible.length > 0 && (
        <p className="pt-2 text-right text-[10px] text-gray-400">
          bar = median · amber tick = p90 · right column = pieces
        </p>
      )}
    </div>
  );
}
