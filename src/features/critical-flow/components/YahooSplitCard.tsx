"use client";

import type { YahooSplitResult } from "../types";
import { fmtHours, fmtInt, fmtPct } from "../format";

interface Props {
  data?: YahooSplitResult;
  isLoading: boolean;
}

export default function YahooSplitCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const sides = [
    { key: "Yahoo / Newsbreak", stats: data.yahoo, color: "bg-indigo-500" },
    { key: "Non-Yahoo", stats: data.nonYahoo, color: "bg-gray-400" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Syndication Split
      </h2>
      <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">
        Pieces flagged for Yahoo/Newsbreak against the rest
        {data.unset > 0 && (
          <>
            {" · "}
            <span className="text-amber-600 dark:text-amber-400">
              {fmtInt(data.unset)} with the flag left blank
            </span>
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {sides.map(({ key, stats, color }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/30"
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {key}
              </p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {fmtInt(stats.count)}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              {fmtInt(stats.published)} published · {fmtHours(stats.medianTatHours)} median
            </p>
            <p className="text-[10px] text-gray-400">
              {fmtPct(stats.sendBackRate)} sent back
            </p>
          </div>
        ))}
      </div>

      {data.byDivision.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {data.byDivision.map((d) => {
            const known = d.yahoo + d.nonYahoo;
            return (
              <div key={d.division} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {d.division}
                </span>
                <div className="flex h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${known ? (d.yahoo / known) * 100 : 0}%` }}
                    title={`${d.yahoo} Yahoo`}
                  />
                  <div
                    className="h-full bg-gray-300 dark:bg-gray-600"
                    style={{ width: `${known ? (d.nonYahoo / known) * 100 : 0}%` }}
                    title={`${d.nonYahoo} non-Yahoo`}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-gray-500 dark:text-gray-400">
                  {fmtPct(d.yahooShare)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
