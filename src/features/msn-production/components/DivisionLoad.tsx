"use client";

import { Users, Flame } from "lucide-react";
import type { InsightsResult } from "../types";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

export default function DivisionLoad({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const divisions = data.divisionLoad.filter((d) => d.published > 0);
  if (!divisions.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Division Load vs Capacity
        </h2>
        <p className="py-10 text-center text-xs text-gray-400">No published output in this period</p>
      </div>
    );
  }

  const maxPerWriter = Math.max(...divisions.map((d) => d.perWriter));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Division Load vs Capacity
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Output per active writer next to free headcount — high load + free
          people elsewhere = a reassignment opportunity
        </p>
      </div>

      <div className="space-y-2">
        {divisions.map((d) => {
          const isHottest = d.perWriter === maxPerWriter && divisions.length > 1;
          return (
            <div
              key={d.division}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 dark:border-gray-800"
            >
              <div className="w-32 shrink-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white">
                  {d.division}
                  {isHottest && (
                    <Flame size={11} className="text-amber-500" aria-label="Highest load per writer" />
                  )}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {d.activeWriters} writers active
                </span>
              </div>

              {/* per-writer load bar */}
              <div className="flex-1">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {d.published} published
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                    {d.perWriter}/writer
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full ${
                      isHottest ? "bg-amber-400" : "bg-indigo-400"
                    }`}
                    style={{
                      width: `${maxPerWriter > 0 ? (d.perWriter / maxPerWriter) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* free capacity */}
              <span
                className={`flex w-20 shrink-0 items-center justify-end gap-1 text-[11px] font-medium ${
                  d.freePeople > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                <Users size={11} />
                {d.freePeople > 0 ? `${d.freePeople} free` : "none free"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
