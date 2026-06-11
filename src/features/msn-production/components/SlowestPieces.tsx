"use client";

import type { StageBoardResult } from "../types";
import { fmtHours, ageTone, AGE_TONE_CLASS } from "../format";

interface Props {
  data?: StageBoardResult;
  isLoading: boolean;
}

const STAGE_BADGE: Record<string, string> = {
  "awaiting-pick":
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  writing:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "awaiting-review":
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  review:
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  ready: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
};

export default function SlowestPieces({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Needs Attention
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Oldest unfinished pieces, by time stuck in their current stage
        </p>
      </div>

      {data.stuck.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          Nothing stuck — pipeline is clear 🎉
        </p>
      ) : (
        <div className="max-h-[380px] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Writer</th>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 text-right font-medium">Stuck for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.stuck.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-[280px] truncate px-3 py-2 text-gray-700 dark:text-gray-300">
                    {p.title || "Untitled"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${STAGE_BADGE[p.stageKey] ?? STAGE_BADGE["awaiting-pick"]}`}
                    >
                      {p.stage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.writer}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
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
