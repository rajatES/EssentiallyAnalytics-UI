"use client";

import type { ModerationResult } from "../types";
import { fmtPct } from "../format";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

const DIM_HINT: Record<string, string> = {
  "Title/Body": "clickbait, unverified claims, title-source mismatch",
  Legal: "legal red flags in source or framing",
  "Feed Fit": "content doesn't belong on the target feed",
  Subjective: "sensationalized or emotionally inflated framing",
};

export default function FailDimensions({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const dims = [...data.failDimensions].sort((a, b) => b.failRate - a.failRate);
  const evaluated = dims.some((d) => d.evaluated > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Why Titles Fail
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Failure rate per check dimension — where writers need guidance
        </p>
      </div>

      {!evaluated ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No evaluated checks in this period
        </p>
      ) : (
        <div className="space-y-4">
          {dims.map((d, i) => (
            <div key={d.dimension}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {d.dimension}
                  {i === 0 && d.failRate > 0 && (
                    <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                      top issue
                    </span>
                  )}
                </span>
                <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  {d.fails}/{d.evaluated} · {fmtPct(d.failRate)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${
                    d.failRate >= 30
                      ? "bg-rose-400"
                      : d.failRate >= 15
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, d.failRate)}%` }}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                {DIM_HINT[d.dimension] ?? ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
