"use client";

import type { ModerationResult } from "../types";
import { fmtPct } from "../format";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

function lastActive(iso: string | null): string {
  if (!iso) return "—";
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  return `${Math.floor(days)}d ago`;
}

export default function ModeratorActivity({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const moderators = data.moderators;
  const maxChecks = moderators.length ? moderators[0].checks : 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Who Runs the Checks
          <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            {moderators.length} users
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Moderation workload and outcomes in the selected period
        </p>
      </div>

      {moderators.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No moderation activity in this period
        </p>
      ) : (
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {moderators.map((m) => (
            <div key={m.user} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {m.user}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  active {lastActive(m.lastCheckAt)}
                </p>
              </div>
              <div className="flex-1">
                <div className="mb-0.5 flex items-baseline justify-between text-[10px] text-gray-400 dark:text-gray-500">
                  <span>
                    {m.checks} checks · {m.distinctTitles} titles
                  </span>
                  <span className="tabular-nums">
                    {fmtPct(m.passRate)} pass
                    {m.avgRisk !== null && ` · risk ${m.avgRisk}`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${(m.checks / maxChecks) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
                {m.checksLast7d}/7d
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
