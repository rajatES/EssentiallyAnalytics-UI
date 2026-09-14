"use client";

import type { InsightsResult } from "../types";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Five steps of indigo — enough contrast to read, few enough to stay calm. */
function cellClass(v: number, max: number): string {
  if (v === 0) return "bg-gray-50 dark:bg-gray-800/40";
  const r = v / max;
  if (r > 0.75) return "bg-indigo-600";
  if (r > 0.5) return "bg-indigo-500";
  if (r > 0.25) return "bg-indigo-400";
  return "bg-indigo-200 dark:bg-indigo-500/40";
}

export default function SubmissionHeatmap({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const grid = new Map<string, number>();
  for (const c of data.submissionHeatmap) grid.set(`${c.weekday}-${c.hour}`, c.count);
  const max = Math.max(...data.submissionHeatmap.map((c) => c.count), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        When Writers Submit
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Submission timestamps by day and hour — shows the shift pattern the
        editorial rota has to cover
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex">
            <div className="w-9 shrink-0" />
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px] text-gray-400"
              >
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {DAYS.map((day, d) => (
            <div key={day} className="mt-0.5 flex items-center">
              <div className="w-9 shrink-0 text-[10px] text-gray-400">{day}</div>
              {Array.from({ length: 24 }).map((_, h) => {
                const v = grid.get(`${d}-${h}`) ?? 0;
                return (
                  <div key={h} className="flex-1 px-[1px]">
                    <div
                      className={`h-5 rounded-[3px] ${cellClass(v, max)}`}
                      title={`${day} ${h}:00 — ${v} submission${v === 1 ? "" : "s"}`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
        <span>less</span>
        <div className="h-3 w-4 rounded-[3px] bg-gray-50 dark:bg-gray-800/40" />
        <div className="h-3 w-4 rounded-[3px] bg-indigo-200 dark:bg-indigo-500/40" />
        <div className="h-3 w-4 rounded-[3px] bg-indigo-400" />
        <div className="h-3 w-4 rounded-[3px] bg-indigo-500" />
        <div className="h-3 w-4 rounded-[3px] bg-indigo-600" />
        <span>more</span>
      </div>
    </div>
  );
}
