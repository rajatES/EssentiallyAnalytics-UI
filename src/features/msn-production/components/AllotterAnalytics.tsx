import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { AllotterStats } from "../types";

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];

interface Props {
  data: AllotterStats[] | undefined;
  isLoading: boolean;
}

type SortKey = "allottedBy" | "volume" | "publishedRate" | "avgLeadTimeHours";

export default function AllotterAnalytics({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortKey === "allottedBy") return a.allottedBy.localeCompare(b.allottedBy) * sortDir;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * sortDir;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === -1 ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  const pieData = useMemo(() => {
    if (!data) return [];
    return data.map((d, i) => ({
      name: d.allottedBy,
      value: d.volume,
      fill: COLORS[i % COLORS.length],
    }));
  }, [data]);

  const totalVolume = useMemo(() => data?.reduce((s, d) => s + d.volume, 0) ?? 0, [data]);

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Allotter Analytics</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Allotter Analytics</h3>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="allottedBy" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="volume" name="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
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
                <span className="font-semibold text-gray-500">{totalVolume > 0 ? ((d.value / totalVolume) * 100).toFixed(1) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              {([
                ["allottedBy", "Allotted By"],
                ["volume", "Volume"],
                ["publishedRate", "Published Rate %"],
                ["avgLeadTimeHours", "Lead Time (h)"],
              ] as [SortKey, string][]).map(([k, label]) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <SortIcon k={k} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Top Feed</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Top Writer</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.allottedBy} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{a.allottedBy}</td>
                <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">{a.volume}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300">{a.publishedRate}%</span>
                    <div className="h-1.5 w-14 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(a.publishedRate, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{a.avgLeadTimeHours}h</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{a.topFeed}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{a.topWriter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
