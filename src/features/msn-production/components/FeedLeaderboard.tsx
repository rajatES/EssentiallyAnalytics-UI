import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { FeedStats } from "../types";

interface Props {
  data: FeedStats[] | undefined;
  isLoading: boolean;
}

type SortKey = "produced" | "allotted" | "published" | "publishRate" | "avgLeadTimeHours" | "feed";

export default function FeedLeaderboard({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("produced");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortKey === "feed") return a.feed.localeCompare(b.feed) * sortDir;
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

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.produced - a.produced).slice(0, 12);
  }, [data]);

  const totals = useMemo(() => {
    if (!data) return { allotted: 0, produced: 0, published: 0, articles: 0, slideshows: 0, ssAutomation: 0 };
    return data.reduce((t, f) => ({
      allotted: t.allotted + f.allotted,
      produced: t.produced + f.produced,
      published: t.published + f.published,
      articles: t.articles + f.articles,
      slideshows: t.slideshows + f.slideshows,
      ssAutomation: t.ssAutomation + f.ssAutomation,
    }), { allotted: 0, produced: 0, published: 0, articles: 0, slideshows: 0, ssAutomation: 0 });
  }, [data]);

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Feed Leaderboard</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Feed Leaderboard</h3>

      <div className="mb-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="feed" width={90} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="produced" name="Produced" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              {([
                ["feed", "Feed"],
                ["allotted", "Allotted"],
                ["produced", "Produced"],
                ["published", "Published"],
                ["publishRate", "Pub Rate %"],
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
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Articles</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SS</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SS Auto</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f) => (
              <tr key={f.feed} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{f.feed}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{f.allotted}</td>
                <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">{f.produced}</td>
                <td className="px-3 py-2 text-green-600 dark:text-green-400">{f.published}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300">{f.publishRate}%</span>
                    <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(f.publishRate, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{f.avgLeadTimeHours}h</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{f.articles}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{f.slideshows}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{f.ssAutomation}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold dark:border-gray-600 dark:bg-gray-800/50">
              <td className="px-3 py-2 text-gray-900 dark:text-white">Total</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{totals.allotted}</td>
              <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{totals.produced}</td>
              <td className="px-3 py-2 text-green-600 dark:text-green-400">{totals.published}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                {totals.allotted > 0 ? ((totals.published / totals.allotted) * 100).toFixed(1) : 0}%
              </td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{totals.articles}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{totals.slideshows}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{totals.ssAutomation}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
