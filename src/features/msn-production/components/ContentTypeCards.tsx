"use client";

import { FileText, Images, Bot, Shapes } from "lucide-react";
import type { InsightsResult } from "../types";
import { fmtHours, fmtPct } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

const TYPE_ICON: Record<string, typeof FileText> = {
  Article: FileText,
  Slideshow: Images,
  "SS Automation": Bot,
};

export default function ContentTypeCards({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const types = data.contentTypes;
  if (!types.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Format Performance
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Which content formats flow through the pipeline and which stall
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {types.map((t) => {
          const Icon = TYPE_ICON[t.contentType] ?? Shapes;
          return (
            <div
              key={t.contentType}
              className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Icon size={15} className="text-indigo-500" />
                  {t.contentType}
                </span>
                <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                  {t.total} pieces
                </span>
              </div>

              {/* publish rate bar */}
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">
                  Publish rate
                </span>
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                  {fmtPct(t.publishRate)}
                </span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${
                    t.publishRate >= 70
                      ? "bg-emerald-500"
                      : t.publishRate >= 40
                        ? "bg-amber-400"
                        : "bg-rose-400"
                  }`}
                  style={{ width: `${Math.min(100, t.publishRate)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Cycle
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtHours(t.medianCycleHours)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Write
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtHours(t.medianWriteHours)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Dropped
                  </p>
                  <p
                    className={`text-xs font-semibold tabular-nums ${
                      t.dropRate > 15
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t.dropped > 0 ? `${t.dropped} (${fmtPct(t.dropRate)})` : "0"}
                  </p>
                </div>
              </div>

              {t.avgSlides !== null && (
                <p className="mt-2 border-t border-gray-50 pt-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
                  ~{t.avgSlides} slides per piece
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
