import { useState, useMemo, useCallback, Fragment } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Download, Search, Copy } from "lucide-react";
import type { RepeatingTitlesResult } from "../types";

interface Props {
  data: RepeatingTitlesResult | undefined;
  isLoading: boolean;
}

type SortKey = "title" | "count";

export default function RepeatingTitlesTable({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [search, setSearch] = useState("");
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data?.titles) return [];
    let rows = data.titles;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.assignments.some((a) => a.writer.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title) * sortDir;
      return (a.count - b.count) * sortDir;
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

  const exportCSV = useCallback(() => {
    if (!filtered.length) return;
    const header = "Title,Times Assigned,Writers,Dates,Feeds,Statuses\n";
    const rows = filtered
      .map((r) => {
        const writers = [...new Set(r.assignments.map((a) => a.writer))].join("; ");
        const dates = [...new Set(r.assignments.map((a) => a.date))].join("; ");
        const feeds = [...new Set(r.assignments.map((a) => a.feed))].join("; ");
        const statuses = [...new Set(r.assignments.map((a) => a.status))].join("; ");
        return `"${r.title.replace(/"/g, '""')}",${r.count},"${writers}","${dates}","${feeds}","${statuses}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repeating_titles.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  if (isLoading || !data?.titles?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Repeating Allotment Titles</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Titles assigned to multiple writers — may need reassignment
        </p>
        <div className="flex h-32 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No repeating titles found"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Repeating Allotment Titles
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              {data.totalCount}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Titles assigned to multiple writers — may need reassignment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title or writer..."
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
              <th className="w-8 px-2 py-2" />
              <th
                onClick={() => toggleSort("title")}
                className="cursor-pointer px-3 py-2 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="inline-flex items-center gap-1">Title <SortIcon k="title" /></span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Writers
              </th>
              <th
                onClick={() => toggleSort("count")}
                className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="inline-flex items-center gap-1">Times Assigned <SortIcon k="count" /></span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Dates
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const key = row.title.toLowerCase().trim();
              const isExpanded = expandedTitle === key;
              const uniqueWriters = [...new Set(row.assignments.map((a) => a.writer))];
              const uniqueDates = [...new Set(row.assignments.map((a) => a.date))].sort();

              return (
                <Fragment key={key}>
                  <tr
                    onClick={() => setExpandedTitle(isExpanded ? null : key)}
                    className="cursor-pointer border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-2 py-2 text-gray-400">
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </td>
                    <td className="max-w-md px-3 py-2 text-gray-900 dark:text-white">
                      <span className="line-clamp-2">{row.title}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {uniqueWriters.map((w) => (
                          <span
                            key={w}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{row.count}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {uniqueDates.join(", ")}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${key}-detail`} className="border-b border-gray-100 dark:border-gray-800">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="rounded-lg border border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Writer</th>
                                <th className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Feed</th>
                                <th className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Allotted By</th>
                                <th className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.assignments.map((a, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-b-0 dark:border-gray-700/50">
                                  <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-white">{a.writer}</td>
                                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{a.date}</td>
                                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{a.feed}</td>
                                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{a.allottedBy}</td>
                                  <td className="px-3 py-1.5">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      a.status === "Published"
                                        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                                        : a.status === "Submitted"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                                        : a.status === "Unknown" || !a.status
                                        ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                                    }`}>
                                      {a.status || "No status"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length < data.totalCount && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Showing {filtered.length} of {data.totalCount} repeating titles
        </p>
      )}
    </div>
  );
}
