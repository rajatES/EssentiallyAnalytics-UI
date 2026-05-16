import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { ContentMixEntry } from "../types";

const COLORS = { article: "#6366f1", slideshow: "#14b8a6", ssAutomation: "#f59e0b" };

interface Props {
  data: ContentMixEntry[] | undefined;
  isLoading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
}

function MixTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800 min-w-[140px]">
      <p className="mb-1 text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function ContentTypeMix({ data, isLoading, granularity, onGranularityChange }: Props) {
  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Content Type Mix</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  const totals = data.reduce(
    (acc, d) => ({
      article: acc.article + d.article,
      slideshow: acc.slideshow + d.slideshow,
      ssAutomation: acc.ssAutomation + d.ssAutomation,
    }),
    { article: 0, slideshow: 0, ssAutomation: 0 },
  );
  const total = totals.article + totals.slideshow + totals.ssAutomation;
  const pieData = [
    { name: "Article", value: totals.article, fill: COLORS.article },
    { name: "Slideshow", value: totals.slideshow, fill: COLORS.slideshow },
    { name: "SS Automation", value: totals.ssAutomation, fill: COLORS.ssAutomation },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Content Type Mix</h3>
        <select
          value={granularity}
          onChange={(e) => onGranularityChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip content={<MixTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" iconSize={10} />
                <Bar dataKey="articlePct" name="Article" fill={COLORS.article} stackId="s" />
                <Bar dataKey="slideshowPct" name="Slideshow" fill={COLORS.slideshow} stackId="s" />
                <Bar dataKey="ssAutomationPct" name="SS Automation" fill={COLORS.ssAutomation} stackId="s" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={2} stroke="#fff">
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
                <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
                <span className="font-semibold text-gray-500">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
