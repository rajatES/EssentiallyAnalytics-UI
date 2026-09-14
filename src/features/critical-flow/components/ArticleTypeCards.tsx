"use client";

import type { ArticleTypeEntry } from "../types";
import { fmtHours, fmtInt, fmtPct } from "../format";

interface Props {
  data?: ArticleTypeEntry[];
  isLoading: boolean;
}

export default function ArticleTypeCards({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Article Type Mix
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        What the divisions are commissioning, and how each format behaves
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.map((t) => (
          <div
            key={t.articleType}
            className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/30"
          >
            <p className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400" title={t.articleType}>
              {t.articleType}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                {fmtInt(t.count)}
              </span>
              <span className="text-[11px] text-gray-400">{fmtPct(t.share)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-indigo-500" style={{ width: `${t.share}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400">
              {fmtHours(t.medianTatHours)} median · {fmtInt(t.published)} published
              {t.sentBack > 0 && ` · ${t.sentBack} back`}
            </p>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-gray-400">
            No article types recorded
          </p>
        )}
      </div>
    </div>
  );
}
