import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, Download, Search } from "lucide-react";
import type { WriterStats } from "../types";

interface Props {
  data: WriterStats[] | undefined;
  isLoading: boolean;
}

type SortKey = "writer" | "allotted" | "submitted" | "published" | "publishRate" | "sentBackRate" | "avgLeadTimeHours" | "articles" | "slideshows" | "total";

export default function WriterPerformanceTable({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.writer.toLowerCase().includes(q));
    }
    return [...rows].sort((a, b) => {
      if (sortKey === "writer") return a.writer.localeCompare(b.writer) * sortDir;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * sortDir;
    });
  }, [data, sortKey, sortDir, search]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === -1 ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  const totals = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.reduce(
      (t, w) => ({
        allotted: t.allotted + w.allotted,
        submitted: t.submitted + w.submitted,
        published: t.published + w.published,
        articles: t.articles + w.articles,
        slideshows: t.slideshows + w.slideshows,
        total: t.total + w.total,
      }),
      { allotted: 0, submitted: 0, published: 0, articles: 0, slideshows: 0, total: 0 },
    );
  }, [filtered]);

  const exportCSV = useCallback(() => {
    if (!filtered.length) return;
    const header = "Writer,Allotted,Submitted,Published,Publish Rate %,Sent Back %,Avg Lead Time (h),Articles,Slideshows,Total\n";
    const rows = filtered.map((w) =>
      `"${w.writer}",${w.allotted},${w.submitted},${w.published},${w.publishRate},${w.sentBackRate},${w.avgLeadTimeHours},${w.articles},${w.slideshows},${w.total}`,
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "writer_performance.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const COLS: [SortKey, string][] = [
    ["writer", "Writer"],
    ["allotted", "Allotted"],
    ["submitted", "Submitted"],
    ["published", "Published"],
    ["publishRate", "Pub Rate %"],
    ["sentBackRate", "Sent Back %"],
    ["avgLeadTimeHours", "Lead Time (h)"],
    ["articles", "Articles"],
    ["slideshows", "Slideshows"],
    ["total", "Total"],
  ];

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Writer Performance</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Writer Performance</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search writer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download size={12} /> CSV
          </button>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.writer} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{w.writer}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{w.allotted}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{w.submitted}</td>
                <td className="px-3 py-2 text-green-600 dark:text-green-400">{w.published}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300">{w.publishRate}%</span>
                    <div className="h-1.5 w-14 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(w.publishRate, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={w.sentBackRate > 10 ? "font-semibold text-red-500" : "text-gray-600 dark:text-gray-400"}>
                    {w.sentBackRate}%
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{w.avgLeadTimeHours}h</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{w.articles}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{w.slideshows}</td>
                <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">{w.total}</td>
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold dark:border-gray-600 dark:bg-gray-800/50">
                <td className="px-3 py-2 text-gray-900 dark:text-white">Total ({filtered.length} writers)</td>
                <td className="px-3 py-2">{totals.allotted}</td>
                <td className="px-3 py-2">{totals.submitted}</td>
                <td className="px-3 py-2 text-green-600 dark:text-green-400">{totals.published}</td>
                <td className="px-3 py-2">{totals.allotted > 0 ? ((totals.published / totals.allotted) * 100).toFixed(1) : 0}%</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2">{totals.articles}</td>
                <td className="px-3 py-2">{totals.slideshows}</td>
                <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{totals.total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
