import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import type { TimeseriesBucket } from "../types";

const COLORS = {
  article: "#6366f1",
  slideshow: "#14b8a6",
  ssAutomation: "#f59e0b",
  allotted: "#94a3b8",
  published: "#22c55e",
};

interface Props {
  data: TimeseriesBucket[] | undefined;
  isLoading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800 min-w-[160px]">
      <p className="mb-1.5 text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((p: any) =>
        p.value > 0 ? (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{p.value}</span>
          </div>
        ) : null,
      )}
    </div>
  );
}

export default function ProductionTimeseries({ data, isLoading, granularity, onGranularityChange }: Props) {
  const [chartType, setChartType] = useState<"stacked" | "grouped" | "line">("stacked");

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Production Over Time</h3>
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Production Over Time</h3>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="stacked">Stacked Bar</option>
            <option value="grouped">Grouped Bar</option>
            <option value="line">Line</option>
          </select>
          <select
            value={granularity}
            onChange={(e) => onGranularityChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
              <Line type="monotone" dataKey="article" name="Article" stroke={COLORS.article} strokeWidth={2} dot={data.length <= 31} />
              <Line type="monotone" dataKey="slideshow" name="Slideshow" stroke={COLORS.slideshow} strokeWidth={2} dot={data.length <= 31} />
              <Line type="monotone" dataKey="ssAutomation" name="SS Automation" stroke={COLORS.ssAutomation} strokeWidth={2} dot={data.length <= 31} />
              <Line type="monotone" dataKey="allotted" name="Allotted" stroke={COLORS.allotted} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" iconSize={10} />
              <Bar dataKey="article" name="Article" fill={COLORS.article} stackId={chartType === "stacked" ? "s" : undefined} radius={chartType === "grouped" ? [3, 3, 0, 0] : undefined} />
              <Bar dataKey="slideshow" name="Slideshow" fill={COLORS.slideshow} stackId={chartType === "stacked" ? "s" : undefined} radius={chartType === "grouped" ? [3, 3, 0, 0] : undefined} />
              <Bar dataKey="ssAutomation" name="SS Automation" fill={COLORS.ssAutomation} stackId={chartType === "stacked" ? "s" : undefined} radius={chartType === "stacked" ? [3, 3, 0, 0] : chartType === "grouped" ? [3, 3, 0, 0] : undefined} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
