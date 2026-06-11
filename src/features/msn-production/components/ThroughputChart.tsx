"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TimeseriesBucket } from "../types";

interface Props {
  data?: TimeseriesBucket[];
  isLoading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
}

export default function ThroughputChart({
  data,
  isLoading,
  granularity,
  onGranularityChange,
}: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Throughput
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Allotted volume vs published output
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {["day", "week"].map((g) => (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                granularity === g
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
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
              dataKey="allotted"
              name="Allotted"
              fill="#818cf8"
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              dataKey="published"
              name="Published"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
