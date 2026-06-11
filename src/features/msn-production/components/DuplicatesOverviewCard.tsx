"use client";

import { CopyX } from "lucide-react";
import type { DuplicatesResult } from "../types";

interface Props {
  data?: DuplicatesResult;
  isLoading: boolean;
}

export default function DuplicatesOverviewCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const clean = data.duplicateTitles === 0;
  const topCats = data.byCategory.slice(0, 3);
  const topAllotters = data.topAllotters.slice(0, 3);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border p-4 ${
        clean
          ? "border-emerald-100 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : "border-fuchsia-100 bg-fuchsia-50/40 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <CopyX size={20} className={clean ? "text-emerald-500" : "text-fuchsia-500"} />
        <div>
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
            {data.duplicateTitles}
            <span className="ml-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              titles allotted more than once
            </span>
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {clean ? (
              "no duplicate allotments in this period"
            ) : (
              <>
                {data.extraAllotments} extra allotment
                {data.extraAllotments !== 1 && "s"} ·{" "}
                {data.affectedPieces} rows involved
                {data.crossFeedGroups > 0 && (
                  <span className="ml-1 font-semibold text-fuchsia-600 dark:text-fuchsia-400">
                    · {data.crossFeedGroups} across different feeds
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {!clean && topCats.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Divisions
          </span>
          {topCats.map((c) => (
            <span
              key={c.name}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700"
            >
              {c.name} <span className="font-semibold tabular-nums">{c.groups}</span>
            </span>
          ))}
        </div>
      )}

      {!clean && topAllotters.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Re-allotted by
          </span>
          {topAllotters.map((a) => (
            <span
              key={a.name}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700"
            >
              {a.name} <span className="font-semibold tabular-nums">{a.extras}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
