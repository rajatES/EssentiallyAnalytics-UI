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
import type { InsightsResult } from "../types";
import { fmtHours } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

export default function WeekdayRhythm({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const rows = data.weekdayRhythm.map((r) => ({ ...r, short: r.weekday.slice(0, 3) }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Weekly Rhythm
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Volume and turnaround by day of the week the piece was allotted
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={rows} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="short" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            yAxisId="tat"
            orientation="right"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            formatter={(v, n) => (n === "Median TAT" ? fmtHours(v as number) : (v ?? 0))}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
          <Bar dataKey="allotted" name="Allotted" fill="#c7d2fe" radius={[3, 3, 0, 0]} />
          <Bar dataKey="published" name="Published" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="tat"
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
