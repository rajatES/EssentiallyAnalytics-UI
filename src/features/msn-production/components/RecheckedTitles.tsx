"use client";

import { RotateCcw } from "lucide-react";
import type { ModerationResult } from "../types";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

function ago(iso: string | null): string {
  if (!iso) return "—";
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (days < 1) return "today";
  return `${Math.floor(days)}d ago`;
}

export default function RecheckedTitles({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <RotateCcw size={14} className="text-amber-500" />
          Re-checked Titles
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Sent through the tool multiple times — repeat failures or duplicate effort
        </p>
      </div>

      {data.rechecks.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No title was checked more than once in this period
        </p>
      ) : (
        <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          {data.rechecks.map((r) => (
            <div
              key={r.title}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[11px] font-bold tabular-nums text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {r.count}×
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300" title={r.title}>
                  {r.title}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {r.users.join(", ")} · last {ago(r.lastCheckedAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  r.lastResult
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                }`}
              >
                {r.lastResult ? "passed" : "still failing"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
