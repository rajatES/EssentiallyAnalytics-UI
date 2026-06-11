"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";
import type { ModerationResult } from "../types";
import { fmtPct } from "../format";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
  onViewAll: () => void;
}

export default function ModerationOverviewCard({ data, isLoading, onViewAll }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const s = data.summary;
  const topCats = data.byCategory.slice(0, 3);
  const topFeeds = data.byFeed.slice(0, 3);
  const clean = s.unmoderatedTotal === 0;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border p-4 ${
        clean
          ? "border-emerald-100 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : "border-amber-100 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <ShieldAlert
          size={20}
          className={clean ? "text-emerald-500" : "text-amber-500"}
        />
        <div>
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
            {s.unmoderatedTotal}
            <span className="ml-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              unmoderated titles
            </span>
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {s.never} never · {s.overMonth} &gt;1mo · {s.over2w} &gt;2wks ·
            coverage {fmtPct(s.coverageRate)}
            {s.publishedUnmoderated > 0 && (
              <span className="ml-1 font-semibold text-rose-600 dark:text-rose-400">
                · {s.publishedUnmoderated} already live
              </span>
            )}
          </p>
        </div>
      </div>

      {!clean && (
        <>
          {topCats.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Divisions
              </span>
              {topCats.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700"
                >
                  {c.name} <span className="font-semibold tabular-nums">{c.total}</span>
                </span>
              ))}
            </div>
          )}
          {topFeeds.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Feeds
              </span>
              {topFeeds.map((f) => (
                <span
                  key={f.name}
                  className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700"
                >
                  {f.name} <span className="font-semibold tabular-nums">{f.total}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <button
        onClick={onViewAll}
        className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-white/60 dark:text-indigo-400 dark:hover:bg-gray-900/40"
      >
        View all <ArrowRight size={12} />
      </button>
    </div>
  );
}
