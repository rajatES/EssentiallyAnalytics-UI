"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { StageBoardResult } from "../types";
import { fmtHours, ageTone, AGE_TONE_CLASS } from "../format";

interface Props {
  data?: StageBoardResult;
  isLoading: boolean;
}

export default function StageBoard({ data, isLoading }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const selectedStage = data.stages.find((s) => s.key === selected);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Pipeline Right Now
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {data.totalWip} pieces in progress · click a stage to see its queue
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          {data.doneLast24h} finished in last 24h
        </span>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {data.stages.map((s, i) => {
          const tone = s.count === 0 ? "ok" : ageTone(s.oldestAgeHours);
          const active = selected === s.key;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => setSelected(active ? null : s.key)}
                className={`w-full flex-1 rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10"
                    : "border-gray-100 bg-gray-50/60 hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-gray-700"
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {s.label}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {s.count}
                </p>
                {s.count > 0 ? (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      med {fmtHours(s.medianAgeHours)}
                    </span>
                    <span
                      className={`rounded px-1 py-px text-[10px] font-medium ${AGE_TONE_CLASS[tone]}`}
                    >
                      max {fmtHours(s.oldestAgeHours)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-300 dark:text-gray-600">
                    clear
                  </p>
                )}
              </button>
              {i < data.stages.length - 1 && (
                <ChevronRight
                  size={14}
                  className="hidden shrink-0 text-gray-300 dark:text-gray-600 lg:block"
                />
              )}
            </div>
          );
        })}
      </div>

      {selectedStage && selectedStage.pieces.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800/60 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Writer</th>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 text-right font-medium">In stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {selectedStage.pieces.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-[300px] truncate px-3 py-2 text-gray-700 dark:text-gray-300">
                    {p.title || "Untitled"}
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.writer}
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.feed}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`rounded px-1.5 py-0.5 font-medium tabular-nums ${AGE_TONE_CLASS[ageTone(p.ageHours)]}`}
                    >
                      {fmtHours(p.ageHours)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
