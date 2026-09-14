"use client";

import type { FunnelStage } from "../types";
import { fmtInt, fmtPct } from "../format";

interface Props {
  data?: FunnelStage[];
  isLoading: boolean;
}

const STAGE_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#10b981"];

export default function FunnelChart({ data, isLoading }: Props) {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const top = data[0].count || 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Pipeline Funnel
      </h2>
      <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">
        Pieces reaching each stage. Counted cumulatively, so a published piece
        also counts as verified even where the source left the status blank.
      </p>

      <div className="space-y-2">
        {data.map((s, i) => (
          <div key={s.stage}>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {s.stage}
              </span>
              <span className="flex items-baseline gap-2 text-xs">
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                  {fmtInt(s.count)}
                </span>
                {i > 0 && (
                  <span
                    className={`tabular-nums ${
                      s.conversion >= 95
                        ? "text-emerald-600 dark:text-emerald-400"
                        : s.conversion >= 85
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {fmtPct(s.conversion)}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-6 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${(s.count / top) * 100}%`,
                  background: STAGE_COLORS[i % STAGE_COLORS.length],
                }}
              />
            </div>
            {i > 0 && s.dropped > 0 && (
              <p className="mt-0.5 text-[10px] text-rose-500 dark:text-rose-400">
                −{fmtInt(s.dropped)} dropped here
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
