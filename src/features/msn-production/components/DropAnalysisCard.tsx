"use client";

import { Trash2 } from "lucide-react";
import type { InsightsResult } from "../types";
import { fmtPct } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

const STAGE_COLOR: Record<string, string> = {
  "Never picked": "bg-gray-300 dark:bg-gray-600",
  "While writing": "bg-indigo-400",
  "Awaiting review": "bg-amber-400",
  "In review": "bg-fuchsia-400",
  "After review": "bg-rose-400",
};

export default function DropAnalysisCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const d = data.dropAnalysis;
  const stageMax = Math.max(...d.byStage.map((s) => s.count), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Trash2 size={14} className="text-rose-500" />
            Where Pieces Die
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Dropped work — how far it got before being killed
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {d.totalDropped} dropped · {fmtPct(d.dropRate)}
        </span>
      </div>

      {d.totalDropped === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          Nothing dropped in this period 🎉
        </p>
      ) : (
        <>
          {/* Stage of death */}
          <div className="mb-4 space-y-1.5">
            {d.byStage.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {s.stage}
                </span>
                <div className="h-3.5 flex-1 overflow-hidden rounded bg-gray-50 dark:bg-gray-800">
                  <div
                    className={`h-full rounded ${STAGE_COLOR[s.stage] ?? "bg-gray-400"}`}
                    style={{ width: `${(s.count / stageMax) * 100}%` }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">
            Drops late in the pipeline (review and after) waste the most effort —
            writing and editing time are already spent.
          </p>

          {/* Worst offenders */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                By division
              </p>
              <div className="space-y-1">
                {d.byCategory.slice(0, 5).map((g) => (
                  <div key={g.name} className="flex items-center justify-between text-xs">
                    <span className="truncate text-gray-600 dark:text-gray-300">{g.name}</span>
                    <span className="ml-2 shrink-0 tabular-nums text-gray-400 dark:text-gray-500">
                      {g.dropped}/{g.total}
                      <span
                        className={`ml-1.5 font-semibold ${
                          g.dropRate > 15
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {fmtPct(g.dropRate)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                By feed
              </p>
              <div className="space-y-1">
                {d.byFeed.slice(0, 5).map((g) => (
                  <div key={g.name} className="flex items-center justify-between text-xs">
                    <span className="truncate text-gray-600 dark:text-gray-300">{g.name}</span>
                    <span className="ml-2 shrink-0 tabular-nums text-gray-400 dark:text-gray-500">
                      {g.dropped}/{g.total}
                      <span
                        className={`ml-1.5 font-semibold ${
                          g.dropRate > 15
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {fmtPct(g.dropRate)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
