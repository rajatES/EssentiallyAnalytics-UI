import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { EditorStats } from "../types";

interface Props {
  data: EditorStats[] | undefined;
  isLoading: boolean;
}

type Metric = "articlesEdited" | "avgTurnaroundHours" | "sentBackRate";

const METRIC_CONFIG: { key: Metric; label: string; suffix?: string; lowerIsBetter?: boolean }[] = [
  { key: "articlesEdited", label: "Pieces Edited" },
  { key: "avgTurnaroundHours", label: "Avg Turnaround", suffix: "h", lowerIsBetter: true },
  { key: "sentBackRate", label: "Sent Back Rate", suffix: "%", lowerIsBetter: true },
];

export default function EditorComparisonChart({ data, isLoading }: Props) {
  const [metric, setMetric] = useState<Metric>("articlesEdited");

  const config = METRIC_CONFIG.find((m) => m.key === metric)!;

  const { chartData, teamAvg } = useMemo(() => {
    if (!data?.length) return { chartData: [], teamAvg: 0 };

    const sorted = [...data]
      .filter((e) => e.articlesEdited > 0)
      .sort((a, b) => (b[metric] as number) - (a[metric] as number))
      .slice(0, 20);

    const values = sorted.map((e) => e[metric] as number);
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;

    return {
      chartData: sorted.map((e) => ({
        name: e.editor,
        value: e[metric] as number,
        aboveAvg: (e[metric] as number) >= avg,
      })),
      teamAvg: Math.round(avg * 10) / 10,
    };
  }, [data, metric]);

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editor Performance vs Baseline</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editor Performance vs Baseline</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="inline-block h-px w-4 border-t-2 border-dashed border-amber-500" />
            Team avg: {teamAvg}{config.suffix || ""}
          </span>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
            className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {METRIC_CONFIG.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}${config.suffix || ""}`}
            />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: any) => [`${v}${config.suffix || ""}`, config.label]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <ReferenceLine x={teamAvg} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={config.lowerIsBetter
                    ? (d.aboveAvg ? "#ef4444" : "#22c55e")
                    : (d.aboveAvg ? "#8b5cf6" : "#d1d5db")
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
