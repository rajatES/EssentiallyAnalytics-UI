import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { EditorStats } from "../types";

interface Props {
  data: EditorStats[] | undefined;
  isLoading: boolean;
}

type SortKey = "editor" | "articlesEdited" | "avgTurnaroundHours" | "sentBackRate";

export default function EditorLoadTable({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("articlesEdited");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortKey === "editor") return a.editor.localeCompare(b.editor) * sortDir;
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
    return [...data].sort((a, b) => b.articlesEdited - a.articlesEdited).slice(0, 15);
  }, [data]);

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editor Load &amp; Turnaround</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  const COLS: [SortKey, string][] = [
    ["editor", "Editor"],
    ["articlesEdited", "Pieces Edited"],
    ["avgTurnaroundHours", "Avg Turnaround (h)"],
    ["sentBackRate", "Sent Back %"],
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Editor Load &amp; Turnaround</h3>

      <div className="mb-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="editor" width={100} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="articlesEdited" name="Pieces Edited" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              {COLS.map(([k, label]) => (
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
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Content Types</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.editor} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{e.editor}</td>
                <td className="px-3 py-2 font-medium text-violet-600 dark:text-violet-400">{e.articlesEdited}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{e.avgTurnaroundHours}h</td>
                <td className="px-3 py-2">
                  <span className={e.sentBackRate > 10 ? "font-semibold text-red-500" : "text-gray-600 dark:text-gray-400"}>
                    {e.sentBackRate}%
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {e.contentTypes.map((ct) => (
                      <span key={ct} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {ct}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
