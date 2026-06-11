"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { InsightsResult, WeekdayPatternEntry } from "../types";
import { fmtHours } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

function RhythmTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry: WeekdayPatternEntry = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-1 font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">
        Allotted: <span className="font-medium tabular-nums">{entry.allotted}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        Published: <span className="font-medium tabular-nums">{entry.published}</span>
      </p>
      {entry.medianCycleHours > 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          Median cycle: <span className="font-medium">{fmtHours(entry.medianCycleHours)}</span>
        </p>
      )}
    </div>
  );
}

export default function WeekdayRhythm({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  // The weekday where output lags intake the most.
  const laggard = [...data.weekdayPattern]
    .filter((w) => w.allotted >= 5)
    .sort(
      (a, b) => a.published / a.allotted - b.published / b.allotted,
    )[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Weekly Rhythm
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Intake vs output by day of week
          </p>
        </div>
        {laggard && laggard.published < laggard.allotted && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            {laggard.weekday}s lag the most
          </span>
        )}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.weekdayPattern}
            margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af22" vertical={false} />
            <XAxis
              dataKey="weekday"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip cursor={{ fill: "#6366f111" }} content={<RhythmTooltip />} />
            <Bar
              dataKey="allotted"
              name="Allotted"
              fill="#818cf8"
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="published"
              name="Published"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="h-2 w-2 rounded-sm bg-indigo-300" /> Allotted
        </span>
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Published
        </span>
      </div>
    </div>
  );
}
