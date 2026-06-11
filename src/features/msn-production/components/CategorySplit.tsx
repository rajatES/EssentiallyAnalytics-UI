"use client";

import type { CategorySplitEntry } from "../types";

interface Props {
  data?: CategorySplitEntry[];
  isLoading: boolean;
}

const SEGMENTS = [
  { key: "published", label: "Published", className: "bg-emerald-500" },
  { key: "scheduled", label: "Scheduled", className: "bg-sky-400" },
  { key: "wip", label: "In progress", className: "bg-amber-400" },
  { key: "dropped", label: "Dropped", className: "bg-rose-400" },
] as const;

export default function CategorySplit({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Divisions
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Volume and outcome per sport category
          </p>
        </div>
        <div className="flex items-center gap-3">
          {SEGMENTS.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
            >
              <span className={`h-2 w-2 rounded-sm ${s.className}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {data.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">
            No pieces in this period
          </p>
        )}
        {data.map((c) => (
          <div key={c.category}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {c.category}
              </span>
              <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                {c.published + c.scheduled}/{c.total} out the door
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              {SEGMENTS.map((s) => {
                const v = c[s.key];
                if (!v) return null;
                return (
                  <div
                    key={s.key}
                    className={s.className}
                    style={{ width: `${(v / c.total) * 100}%` }}
                    title={`${s.label}: ${v}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
