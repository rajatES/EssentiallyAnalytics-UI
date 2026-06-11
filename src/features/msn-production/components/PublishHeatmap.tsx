"use client";

import type { InsightsResult } from "../types";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function PublishHeatmap({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const cells = new Map<string, number>();
  let max = 0;
  for (const c of data.publishHeatmap) {
    cells.set(`${c.weekday}|${c.hour}`, c.count);
    if (c.count > max) max = c.count;
  }

  // Peak window summary
  const peak = [...data.publishHeatmap].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Publish Times
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            When pieces actually go live (IST)
          </p>
        </div>
        {peak && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            Peak: {peak.weekday} {peak.hour}:00
          </span>
        )}
      </div>

      {max === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No publish timestamps in this period
        </p>
      ) : (
        <div className="space-y-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="flex items-center gap-1.5">
              <span className="w-8 shrink-0 text-right text-[10px] text-gray-400 dark:text-gray-500">
                {wd}
              </span>
              <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
                {HOURS.map((h) => {
                  const count = cells.get(`${wd}|${h}`) ?? 0;
                  const alpha = count > 0 ? 0.15 + 0.85 * (count / max) : 0;
                  return (
                    <div
                      key={h}
                      title={count > 0 ? `${wd} ${h}:00 — ${count} published` : undefined}
                      className="aspect-square rounded-[2px] bg-gray-100 dark:bg-gray-800"
                      style={
                        count > 0
                          ? { backgroundColor: `rgba(99, 102, 241, ${alpha})` }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {/* hour axis */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-8 shrink-0" />
            <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-px text-center">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="text-[9px] text-gray-300 dark:text-gray-600"
                >
                  {h % 6 === 0 ? h : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
