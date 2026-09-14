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
  Legend,
} from "recharts";
import type { TimeseriesBucket } from "../types";
import { fmtDay, fmtHours } from "../format";

interface Props {
  data?: TimeseriesBucket[];
  isLoading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
}

const GRANULARITIES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

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
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Allotted vs published, with median turnaround
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {GRANULARITIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onGranularityChange(key)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                granularity === key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="bucket"
            tickFormatter={granularity === "day" ? fmtDay : undefined}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(value, name) =>
              name === "Median TAT" ? fmtHours(value as number) : (value ?? 0)
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
          <Bar yAxisId="left" dataKey="allotted" name="Allotted" fill="#c7d2fe" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="published" name="Published" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="sentBack" name="Sent Back" fill="#f43f5e" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="medianTatHours"
            name="Median TAT"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
