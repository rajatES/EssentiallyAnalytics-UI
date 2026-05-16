import { useState, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Search, Users, User, TrendingUp, Calendar, Grid3X3, BarChart3, X } from "lucide-react";
import type { DailyBreakdownResult, DailyBreakdownEntry, PersonAverage } from "../types";

interface Props {
  data: DailyBreakdownResult | undefined;
  isLoading: boolean;
}

type Tab = "snapshot" | "grid" | "progress" | "averages" | "charts";
type AvgSortKey = "name" | "avgSlides" | "avgSlideshows" | "avgArticles" | "avgTotal" | "activeDays";
type SnapshotSortKey = "name" | "slides" | "slideshows" | "articles" | "total";

const LINE_COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#a855f7",
  "#10b981", "#e11d48", "#0ea5e9", "#eab308", "#d946ef",
  "#22d3ee", "#fb923c", "#4ade80", "#f43f5e", "#818cf8",
];

export default function WriterDailyBreakdown({ data, isLoading }: Props) {
  const [tab, setTab] = useState<Tab>("snapshot");
  const [selectedWriter, setSelectedWriter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [snapshotDate, setSnapshotDate] = useState<string>("");
  const [snapSort, setSnapSort] = useState<SnapshotSortKey>("total");
  const [snapDir, setSnapDir] = useState<1 | -1>(-1);
  const [avgSortKey, setAvgSortKey] = useState<AvgSortKey>("avgTotal");
  const [avgSortDir, setAvgSortDir] = useState<1 | -1>(-1);
  const gridRef = useRef<HTMLDivElement>(null);

  // Progress tab state
  const [progressSelected, setProgressSelected] = useState<string[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [progressDropdownOpen, setProgressDropdownOpen] = useState(false);
  const [progressSearch, setProgressSearch] = useState("");

  // ── Derived data ──

  const allDates = useMemo(() => {
    if (!data?.daily) return [];
    const set = new Set(data.daily.map((r) => r.date));
    return [...set].sort();
  }, [data]);

  const writers = useMemo(() => {
    if (!data?.personalAverages) return [];
    return data.personalAverages.map((p) => p.name).sort();
  }, [data]);

  const activeSnapshotDate = snapshotDate || allDates[allDates.length - 1] || "";

  // ── Snapshot view data ──

  const snapshotRows = useMemo(() => {
    if (!data?.daily || !activeSnapshotDate) return [];
    let rows = data.daily.filter((r) => r.date === activeSnapshotDate);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    return [...rows].sort((a, b) => {
      if (snapSort === "name") return a.name.localeCompare(b.name) * snapDir;
      return ((a[snapSort] as number) - (b[snapSort] as number)) * snapDir;
    });
  }, [data, activeSnapshotDate, search, snapSort, snapDir]);

  const dateIdx = allDates.indexOf(activeSnapshotDate);
  const canPrev = dateIdx > 0;
  const canNext = dateIdx < allDates.length - 1;

  // ── Grid view data ──

  const gridData = useMemo(() => {
    if (!data?.daily || !allDates.length) return { writers: [] as string[], dates: [] as string[], map: new Map<string, Map<string, DailyBreakdownEntry>>() };
    const map = new Map<string, Map<string, DailyBreakdownEntry>>();
    for (const r of data.daily) {
      if (!map.has(r.name)) map.set(r.name, new Map());
      map.get(r.name)!.set(r.date, r);
    }
    let writerList = [...map.keys()].sort();
    if (search) {
      const q = search.toLowerCase();
      writerList = writerList.filter((w) => w.toLowerCase().includes(q));
    }
    return { writers: writerList, dates: allDates, map };
  }, [data, allDates, search]);

  // Personal avg lookup
  const avgMap = useMemo(() => {
    if (!data?.personalAverages) return new Map<string, PersonAverage>();
    const m = new Map<string, PersonAverage>();
    for (const p of data.personalAverages) m.set(p.name, p);
    return m;
  }, [data]);

  // ── Progress tab data ──

  const { progressChartData, rankedWriters, writerTotals } = useMemo(() => {
    if (!data?.daily?.length) return { progressChartData: [] as Record<string, string | number>[], rankedWriters: [] as string[], writerTotals: new Map<string, number>() };
    const dateMap = new Map<string, Map<string, number>>();
    const wSet = new Set<string>();
    const totals = new Map<string, number>();
    for (const r of data.daily) {
      wSet.add(r.name);
      if (!dateMap.has(r.date)) dateMap.set(r.date, new Map());
      dateMap.get(r.date)!.set(r.name, r.total);
      totals.set(r.name, (totals.get(r.name) || 0) + r.total);
    }
    const sortedDates = [...dateMap.keys()].sort();
    const cd = sortedDates.map((date) => {
      const dayMap = dateMap.get(date)!;
      const d = new Date(date + "T00:00:00");
      const formatted = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
      const entry: Record<string, string | number> = { date: formatted };
      for (const w of wSet) entry[w] = dayMap.get(w) || 0;
      return entry;
    });
    const ranked = [...wSet].sort((a, b) => (totals.get(b) || 0) - (totals.get(a) || 0));
    return { progressChartData: cd, rankedWriters: ranked, writerTotals: totals };
  }, [data]);

  const activeProgressWriters = progressSelected.length > 0 ? progressSelected : rankedWriters.slice(0, 10);

  const filteredProgressDropdown = useMemo(() => {
    if (!progressSearch) return rankedWriters;
    const q = progressSearch.toLowerCase();
    return rankedWriters.filter((w) => w.toLowerCase().includes(q));
  }, [rankedWriters, progressSearch]);

  const toggleProgressWriter = (w: string) => {
    setProgressSelected((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
  };
  const selectProgressTop = (n: number) => {
    setProgressSelected(rankedWriters.slice(0, n));
    setProgressDropdownOpen(false);
  };

  // ── Averages tab ──

  const filteredAvg = useMemo(() => {
    if (!data?.personalAverages) return [];
    let rows = data.personalAverages;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    return [...rows].sort((a, b) => {
      if (avgSortKey === "name") return a.name.localeCompare(b.name) * avgSortDir;
      return ((a[avgSortKey] as number) - (b[avgSortKey] as number)) * avgSortDir;
    });
  }, [data, search, avgSortKey, avgSortDir]);

  // ── Charts tab ──

  const chartData = useMemo(() => {
    if (!data?.daily || !selectedWriter) return [];
    return data.daily
      .filter((r) => r.name === selectedWriter)
      .map((r) => ({ date: r.date.slice(5), slides: r.slides, slideshows: r.slideshows, articles: r.articles, total: r.total }));
  }, [data, selectedWriter]);

  const comparisonData = useMemo(() => {
    if (!data?.personalAverages?.length) return [];
    return [...data.personalAverages]
      .filter((p) => p.avgTotal > 0)
      .sort((a, b) => b.avgTotal - a.avgTotal)
      .slice(0, 25)
      .map((p) => ({ name: p.name, avgArticles: p.avgArticles, avgSlideshows: p.avgSlideshows, avgSlides: p.avgSlides, avgTotal: p.avgTotal }));
  }, [data]);

  const personalAvgForWriter = useMemo(() => {
    if (!selectedWriter) return null;
    return avgMap.get(selectedWriter) ?? null;
  }, [avgMap, selectedWriter]);

  // ── Handlers ──

  const toggleSnapSort = (key: SnapshotSortKey) => {
    if (snapSort === key) setSnapDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else { setSnapSort(key); setSnapDir(-1); }
  };

  const toggleAvgSort = (key: AvgSortKey) => {
    if (avgSortKey === key) setAvgSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else { setAvgSortKey(key); setAvgSortDir(-1); }
  };

  const exportCSV = useCallback(() => {
    if (!data?.daily?.length) return;
    const header = "Writer,Date,Slides,Slideshows,Articles,Total\n";
    const rows = data.daily.map((r) => `"${r.name}","${r.date}",${r.slides},${r.slideshows},${r.articles},${r.total}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "writer_daily_breakdown.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // ── Render ──

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Writer Daily Breakdown</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">{isLoading ? "Loading..." : "No data"}</div>
      </div>
    );
  }

  const teamAvg = data.teamAverage;

  const TABS: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: "snapshot", label: "Daily", icon: Calendar },
    { key: "grid", label: "Grid", icon: Grid3X3 },
    { key: "progress", label: "Progress", icon: TrendingUp },
    { key: "averages", label: "Averages", icon: Users },
    { key: "charts", label: "Charts", icon: BarChart3 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Writer Daily Breakdown</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-300 dark:border-gray-600">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  tab === t.key ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                } ${i === 0 ? "rounded-l-md" : ""} ${i === TABS.length - 1 ? "rounded-r-md" : ""}`}
              >
                <t.icon size={11} />
                {t.label}
              </button>
            ))}
          </div>
          {tab === "charts" && (
            <select
              value={selectedWriter}
              onChange={(e) => setSelectedWriter(e.target.value)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="">Select Writer</option>
              {writers.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          )}
          {tab !== "progress" && (
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          )}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <Download size={12} /> CSV
          </button>
        </div>
      </div>

      {/* Team Average Banner */}
      <div className="mb-4 flex flex-wrap gap-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 p-3 dark:from-indigo-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-indigo-500" />
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Team Avg/Day:</span>
        </div>
        {[
          { v: teamAvg.avgSlides, l: "slides" },
          { v: teamAvg.avgSlideshows, l: "slideshows" },
          { v: teamAvg.avgArticles, l: "articles" },
        ].map((m) => (
          <span key={m.l} className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
            {m.v} {m.l}
          </span>
        ))}
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-800/50 dark:text-indigo-300">
          {teamAvg.avgTotal} total
        </span>
      </div>

      {/* ═══ Snapshot Tab ═══ */}
      {tab === "snapshot" && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <button disabled={!canPrev} onClick={() => setSnapshotDate(allDates[dateIdx - 1])} className="rounded-md border border-gray-300 p-1 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800">
              <Calendar size={14} className="text-indigo-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDateLabel(activeSnapshotDate)}</span>
              <span className="text-[10px] text-gray-400">{activeSnapshotDate}</span>
            </div>
            <button disabled={!canNext} onClick={() => setSnapshotDate(allDates[dateIdx + 1])} className="rounded-md border border-gray-300 p-1 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"><ChevronRight size={16} /></button>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{snapshotRows.length} writer{snapshotRows.length !== 1 ? "s" : ""} active</span>
          </div>
          {snapshotRows.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">No writer data for this date.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    {([["name", "Writer"], ["slides", "Slides"], ["slideshows", "Slideshows"], ["articles", "Articles"], ["total", "Total"]] as [SnapshotSortKey, string][]).map(([k, label]) => (
                      <th key={k} onClick={() => toggleSnapSort(k)} className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <span className="inline-flex items-center gap-1">{label}{snapSort === k && (snapDir === -1 ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}</span>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">vs Personal Avg</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">vs Team Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshotRows.map((r) => {
                    const pAvg = avgMap.get(r.name);
                    const pDelta = pAvg ? r.total - pAvg.avgTotal : 0;
                    const tDelta = r.total - teamAvg.avgTotal;
                    return (
                      <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{r.name}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.slides}</td>
                        <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{r.slideshows}</td>
                        <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{r.articles}</td>
                        <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">{r.total}</td>
                        <td className="px-3 py-2"><DeltaBadge value={pDelta} /></td>
                        <td className="px-3 py-2"><DeltaBadge value={tDelta} /></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold dark:border-gray-600 dark:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-900 dark:text-white">Day Total</td>
                    <td className="px-3 py-2">{snapshotRows.reduce((s, r) => s + r.slides, 0)}</td>
                    <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{snapshotRows.reduce((s, r) => s + r.slideshows, 0)}</td>
                    <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{snapshotRows.reduce((s, r) => s + r.articles, 0)}</td>
                    <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{snapshotRows.reduce((s, r) => s + r.total, 0)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ Grid Tab ═══ */}
      {tab === "grid" && (
        <div>
          <p className="mb-2 text-[10px] text-gray-400 dark:text-gray-500">Each cell shows total output. Hover for breakdown. Color: <span className="text-emerald-600">green</span> = above personal avg, <span className="text-red-500">red</span> = below.</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700" ref={gridRef}>
            <table className="w-max min-w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="sticky left-0 z-10 min-w-[120px] border-r border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">Writer</th>
                  <th className="sticky left-[120px] z-10 min-w-[48px] border-r border-gray-200 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-indigo-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-indigo-400">Avg</th>
                  {gridData.dates.map((d) => (
                    <th key={d} className="min-w-[48px] border-l border-gray-100 px-1 py-2 text-center font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400"><div className="text-[10px] leading-tight">{formatShortDate(d)}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridData.writers.map((writer) => {
                  const writerDays = gridData.map.get(writer)!;
                  const pAvg = avgMap.get(writer);
                  const avg = pAvg?.avgTotal ?? 0;
                  return (
                    <tr key={writer} className="border-t border-gray-50 hover:bg-gray-50/30 dark:border-gray-800/50 dark:hover:bg-gray-800/20">
                      <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">{writer}</td>
                      <td className="sticky left-[120px] z-10 border-r border-gray-200 bg-white px-2 py-1.5 text-center font-bold text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-400">{avg > 0 ? avg.toFixed(1) : "—"}</td>
                      {gridData.dates.map((d) => {
                        const entry = writerDays.get(d);
                        if (!entry || entry.total === 0) return <td key={d} className="border-l border-gray-50 px-1 py-1.5 text-center text-gray-300 dark:border-gray-800/50 dark:text-gray-700">—</td>;
                        const delta = avg > 0 ? entry.total - avg : 0;
                        const bg = avg === 0 ? "bg-gray-50 dark:bg-gray-800/30" : delta >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/15";
                        const text = avg === 0 ? "text-gray-700 dark:text-gray-300" : delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
                        return (
                          <td key={d} className="border-l border-gray-50 px-1 py-1.5 text-center dark:border-gray-800/50">
                            <div className={`group relative inline-flex min-w-[28px] items-center justify-center rounded px-1 py-0.5 font-bold ${bg} ${text}`}>
                              {entry.total}
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl group-hover:block dark:border-gray-700 dark:bg-gray-900">
                                <div className="whitespace-nowrap text-[11px]">
                                  <div className="mb-1 font-bold text-gray-900 dark:text-white">{writer} — {d}</div>
                                  <div className="text-gray-500 dark:text-gray-400">Slides: <span className="font-semibold text-gray-700 dark:text-gray-200">{entry.slides}</span></div>
                                  <div className="text-blue-500">Slideshows: <span className="font-semibold">{entry.slideshows}</span></div>
                                  <div className="text-emerald-500">Articles: <span className="font-semibold">{entry.articles}</span></div>
                                  <div className="mt-1 border-t border-gray-100 pt-1 font-bold text-indigo-600 dark:border-gray-800 dark:text-indigo-400">Total: {entry.total}</div>
                                  {avg > 0 && <div className={`text-[10px] ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)} vs avg</div>}
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Progress Tab (multi-line daily chart) ═══ */}
      {tab === "progress" && progressChartData.length >= 2 && (
        <div>
          {/* Controls bar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Hover lines to highlight — </p>
            <div className="hidden sm:flex items-center gap-1">
              {[5, 10, 15].map((n) => (
                <button key={n} onClick={() => selectProgressTop(n)} className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${progressSelected.length === n && progressSelected.every((w, i) => w === rankedWriters[i]) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
                  Top {n}
                </button>
              ))}
            </div>
            <div className="relative">
              <button onClick={() => setProgressDropdownOpen(!progressDropdownOpen)} className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                <Users size={12} />
                {progressSelected.length > 0 ? `${progressSelected.length} selected` : `Top ${activeProgressWriters.length}`}
                <ChevronDown size={12} className={`transition-transform ${progressDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {progressDropdownOpen && (
                <div className="absolute right-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-100 p-2 dark:border-gray-800">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Search writers..." value={progressSearch} onChange={(e) => setProgressSearch(e.target.value)} className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" autoFocus />
                    </div>
                  </div>
                  <div className="flex gap-1 border-b border-gray-100 px-2 py-1.5 dark:border-gray-800">
                    <button onClick={() => { setProgressSelected([]); setProgressDropdownOpen(false); }} className="rounded px-2 py-0.5 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-800">All (Top 10)</button>
                    <button onClick={() => selectProgressTop(5)} className="rounded px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">Top 5</button>
                    <button onClick={() => { setProgressSelected(rankedWriters); setProgressDropdownOpen(false); }} className="rounded px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">Select All</button>
                    <button onClick={() => setProgressSelected([])} className="rounded px-2 py-0.5 text-[10px] font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800">Clear</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5">
                    {filteredProgressDropdown.map((w) => {
                      const isSelected = progressSelected.includes(w);
                      const total = writerTotals.get(w) || 0;
                      const colorIdx = activeProgressWriters.indexOf(w);
                      return (
                        <button key={w} onClick={() => toggleProgressWriter(w)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${isSelected ? "bg-indigo-50/50 font-semibold text-gray-900 dark:bg-indigo-900/20 dark:text-white" : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
                          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colorIdx >= 0 ? LINE_COLORS[colorIdx % LINE_COLORS.length] : "#d1d5db" }} />
                          <span className="flex-1 truncate">{w}</span>
                          <span className="text-[10px] text-gray-400">{total}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected pills */}
          {progressSelected.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {progressSelected.map((w, i) => (
                <span key={w} onClick={() => toggleProgressWriter(w)} className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors hover:opacity-80" style={{ backgroundColor: `${LINE_COLORS[i % LINE_COLORS.length]}15`, color: LINE_COLORS[i % LINE_COLORS.length], border: `1px solid ${LINE_COLORS[i % LINE_COLORS.length]}30` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }} />{w}<X size={9} />
                </span>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }} onMouseLeave={() => setHoveredKey(null)}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                {teamAvg.avgTotal > 0 && <ReferenceLine y={teamAvg.avgTotal} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Team avg: ${teamAvg.avgTotal}`, position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }} />}
                <Tooltip isAnimationActive={false} content={(props: any) => <ProgressTooltip {...props} hoveredKey={hoveredKey} />} />
                {activeProgressWriters.map((w, i) => (
                  <Line key={w} type="monotone" dataKey={w} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={hoveredKey === w ? 3 : hoveredKey === null ? 2 : 1} strokeOpacity={hoveredKey === null || hoveredKey === w ? 1 : 0.15} dot={progressChartData.length <= 15 ? { r: 2.5 } : false} activeDot={hoveredKey === w ? { r: 6, strokeWidth: 2, stroke: "#fff" } : false} isAnimationActive={false} />
                ))}
                {activeProgressWriters.map((w) => (
                  <Line key={`${w}-hover`} type="monotone" dataKey={w} stroke="transparent" strokeWidth={30} dot={false} activeDot={false} isAnimationActive={false} onMouseEnter={() => setHoveredKey(w)} onMouseLeave={() => setHoveredKey(null)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {tab === "progress" && progressChartData.length < 2 && (
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">Not enough data points for a progress chart.</div>
      )}

      {/* ═══ Averages Tab ═══ */}
      {tab === "averages" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                {([["name", "Writer"], ["avgSlides", "Avg Slides/Day"], ["avgSlideshows", "Avg SS/Day"], ["avgArticles", "Avg Articles/Day"], ["avgTotal", "Avg Total/Day"], ["activeDays", "Active Days"]] as [AvgSortKey, string][]).map(([k, label]) => (
                  <th key={k} onClick={() => toggleAvgSort(k)} className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <span className="inline-flex items-center gap-1">{label}{avgSortKey === k && (avgSortDir === -1 ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}</span>
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Totals</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">vs Team</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvg.map((p) => {
                const tDelta = p.avgTotal - teamAvg.avgTotal;
                return (
                  <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                    <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{p.avgSlides}</td>
                    <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{p.avgSlideshows}</td>
                    <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{p.avgArticles}</td>
                    <td className="px-3 py-2 font-medium text-indigo-600 dark:text-indigo-400">{p.avgTotal}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{p.activeDays}d</td>
                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">{p.totalSlideshows}ss / {p.totalArticles}a / {p.totalSlides}sl</td>
                    <td className="px-3 py-2"><DeltaBadge value={tDelta} /></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold dark:border-gray-600 dark:bg-gray-800/50">
                <td className="px-3 py-2 text-gray-900 dark:text-white">Team Average</td>
                <td className="px-3 py-2">{teamAvg.avgSlides}</td>
                <td className="px-3 py-2 text-blue-600 dark:text-blue-400">{teamAvg.avgSlideshows}</td>
                <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{teamAvg.avgArticles}</td>
                <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{teamAvg.avgTotal}</td>
                <td className="px-3 py-2" colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ═══ Charts Tab ═══ */}
      {tab === "charts" && (
        <div className="space-y-4">
          {selectedWriter && chartData.length > 0 ? (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"><TrendingUp size={14} /> {selectedWriter} — Daily Output</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {personalAvgForWriter && <ReferenceLine y={personalAvgForWriter.avgTotal} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} label={{ value: `Avg: ${personalAvgForWriter.avgTotal}`, position: "insideTopRight", fill: "#10b981", fontSize: 10 }} />}
                    <ReferenceLine y={teamAvg.avgTotal} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} label={{ value: `Team: ${teamAvg.avgTotal}`, position: "insideBottomRight", fill: "#f59e0b", fontSize: 10 }} />
                    <Line type="monotone" dataKey="articles" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Articles" />
                    <Line type="monotone" dataKey="slideshows" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Slideshows" />
                    <Line type="monotone" dataKey="slides" stroke="#8b5cf6" strokeWidth={1} dot={false} name="Slides" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            !selectedWriter && <p className="mb-2 text-xs text-gray-400">Select a writer above to see their daily trend chart.</p>
          )}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"><Users size={14} /> Writer Comparison — Avg Total/Day (Top 25)</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine x={teamAvg.avgTotal} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                  <Bar dataKey="avgArticles" name="Articles" fill="#10b981" stackId="a" barSize={14} />
                  <Bar dataKey="avgSlideshows" name="Slideshows" fill="#3b82f6" stackId="a" barSize={14} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function DeltaBadge({ value }: { value: number }) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span className="text-[11px] text-gray-400">—</span>;
  const positive = rounded > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${positive ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
      {positive ? "+" : ""}{rounded}
    </span>
  );
}

function ProgressTooltip({ active, payload, label, hoveredKey }: any) {
  if (!active || !payload?.length) return null;
  if (hoveredKey) {
    const entry = payload.find((p: any) => p.dataKey === hoveredKey);
    if (!entry || !Number(entry.value)) return null;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 min-w-[140px]">
        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} /><span className="text-xs font-semibold truncate" style={{ color: entry.color }}>{entry.dataKey}</span></div>
        <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{entry.value} pieces</p>
      </div>
    );
  }
  const sorted = [...payload].filter((p: any) => Number(p.value) > 0).sort((a: any, b: any) => (Number(b.value) || 0) - (Number(a.value) || 0));
  if (!sorted.length) return null;
  const total = sorted.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800 min-w-[180px] max-h-[320px] overflow-y-auto">
      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {sorted.slice(0, 15).map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 truncate max-w-[120px]" style={{ color: p.color }}><span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />{p.dataKey}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{p.value}</span>
        </div>
      ))}
      {sorted.length > 15 && <p className="text-[10px] text-gray-400 mt-1">+{sorted.length - 15} more</p>}
      <div className="mt-1.5 border-t border-gray-200 dark:border-gray-700 pt-1.5 flex justify-between text-xs font-bold text-gray-900 dark:text-white"><span>Total</span><span>{total}</span></div>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "—";
  try { const d = new Date(dateStr + "T00:00:00"); return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }); } catch { return dateStr; }
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  try { const d = new Date(dateStr + "T00:00:00"); const day = d.getDate(); const mon = d.toLocaleDateString("en-US", { month: "short" }); const dow = d.toLocaleDateString("en-US", { weekday: "short" }); return `${dow}\n${mon} ${day}`; } catch { return dateStr.slice(5); }
}
