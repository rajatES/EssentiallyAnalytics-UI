"use client";

import type { AvailabilityResult } from "../types";

interface Props {
  data?: AvailabilityResult;
  isLoading: boolean;
}

export default function WorkloadTable({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const busy = [
    ...data.people.filter((p) => p.activePieces > 0),
    ...data.unmatchedActive,
  ].sort((a, b) => b.activePieces - a.activePieces);

  const max = busy.length ? busy[0].activePieces : 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Current Workload
          <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            {busy.length} people
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Active pieces per person — writing and reviewing
        </p>
      </div>

      {busy.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">
          Nobody has active work right now
        </p>
      ) : (
        <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {busy.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-36 shrink-0 truncate">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {p.name}
                </span>
                {!p.inRoster && (
                  <span
                    className="ml-1.5 rounded bg-amber-50 px-1 py-px text-[9px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    title="Has active work but not found on the roster"
                  >
                    off-roster
                  </span>
                )}
                {p.isWeekoffToday && (
                  <span className="ml-1.5 rounded bg-gray-100 px-1 py-px text-[9px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    weekoff
                  </span>
                )}
              </div>
              <div className="flex h-4 flex-1 overflow-hidden rounded bg-gray-50 dark:bg-gray-800">
                {p.activeWriting > 0 && (
                  <div
                    className="bg-indigo-400"
                    style={{ width: `${(p.activeWriting / max) * 100}%` }}
                    title={`Writing: ${p.activeWriting}`}
                  />
                )}
                {p.activeEditing > 0 && (
                  <div
                    className="bg-fuchsia-400"
                    style={{ width: `${(p.activeEditing / max) * 100}%` }}
                    title={`Reviewing: ${p.activeEditing}`}
                  />
                )}
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
                {p.activePieces}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="h-2 w-2 rounded-sm bg-indigo-400" /> Writing
        </span>
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="h-2 w-2 rounded-sm bg-fuchsia-400" /> Reviewing
        </span>
      </div>
    </div>
  );
}
