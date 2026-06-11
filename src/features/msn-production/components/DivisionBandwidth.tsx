"use client";

import type { AvailabilityResult } from "../types";

interface Props {
  data?: AvailabilityResult;
  isLoading: boolean;
}

export default function DivisionBandwidth({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Division Bandwidth
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Roster headcount vs people with active work · {data.weekdayToday}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Busy", className: "bg-indigo-500" },
            { label: "Free", className: "bg-emerald-400" },
            { label: "Weekoff", className: "bg-gray-300 dark:bg-gray-600" },
          ].map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
            >
              <span className={`h-2 w-2 rounded-sm ${s.className}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {data.divisions.map((d) => (
          <div key={d.division}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {d.division}
              </span>
              <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {d.free} free
                </span>{" "}
                · {d.busy} busy · {d.weekoffToday} off · {d.total} total
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              {d.busy > 0 && (
                <div
                  className="bg-indigo-500"
                  style={{ width: `${(d.busy / d.total) * 100}%` }}
                  title={`Busy: ${d.busy}`}
                />
              )}
              {d.free > 0 && (
                <div
                  className="bg-emerald-400"
                  style={{ width: `${(d.free / d.total) * 100}%` }}
                  title={`Free: ${d.free}`}
                />
              )}
              {d.weekoffToday > 0 && (
                <div
                  className="bg-gray-300 dark:bg-gray-600"
                  style={{ width: `${(d.weekoffToday / d.total) * 100}%` }}
                  title={`Weekoff today: ${d.weekoffToday}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
