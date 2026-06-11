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
import type { ModerationResult } from "../types";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

export default function ModerationTimeline({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Moderation Volume
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Checks per day — passed vs flagged
        </p>
      </div>

      {data.timeline.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No moderation checks in this period
        </p>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.timeline}
                margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af22" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#6366f111" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                    background: "var(--tooltip-bg, #fff)",
                  }}
                />
                <Bar
                  dataKey="passed"
                  name="Passed"
                  stackId="checks"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="failed"
                  name="Flagged"
                  stackId="checks"
                  fill="#f43f5e"
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Passed
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="h-2 w-2 rounded-sm bg-rose-400" /> Flagged
            </span>
          </div>
        </>
      )}
    </div>
  );
}
