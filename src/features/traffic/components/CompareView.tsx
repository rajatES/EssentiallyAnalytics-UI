"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus, Download, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadRowsCsv } from "@/lib/tableCsv";
import { getPlatform, type TrafficPlatformKey } from "@/lib/traffic-platforms";
import { useCompareData, type ComparedRow, type DateRange } from "../hooks/useCompareData";

function DeltaBadge({ pct, delta }: { pct: number | null; delta: number }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        new
      </span>
    );
  }
  const flat = Math.abs(pct) < 0.05;
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
        flat
          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          : up
            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      )}
    >
      {flat ? <Minus className="w-3 h-3" /> : up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up && !flat ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

function RangePicker({
  label,
  tone,
  range,
  onChange,
}: {
  label: string;
  tone: "a" | "b";
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-[260px] rounded-xl border p-3",
        tone === "a"
          ? "border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20"
          : "border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
            tone === "a"
              ? "bg-blue-600 text-white"
              : "bg-gray-500 text-white",
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="date"
          value={range.start}
          onChange={(e) => onChange({ ...range, start: e.target.value })}
          className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer w-[130px]"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => onChange({ ...range, end: e.target.value })}
          className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer w-[130px]"
        />
      </div>
    </div>
  );
}

function ComparisonTable({
  title,
  subtitle,
  rows,
  labelHeader,
}: {
  title: string;
  subtitle: string;
  rows: ComparedRow[];
  labelHeader: string;
}) {
  const [limit, setLimit] = useState(25);
  const shown = rows.slice(0, limit);

  const handleExport = () =>
    downloadRowsCsv(
      [labelHeader, "Group", "Period A", "Period B", "Change", "% Change"],
      rows.map((r) => [
        r.label,
        r.sublabel ?? "",
        r.a,
        r.b,
        r.delta,
        r.pct === null ? "new" : r.pct.toFixed(2),
      ]),
      `compare-${title.toLowerCase().replace(/\s+/g, "-")}`,
    );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!rows.length}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 font-bold">{labelHeader}</th>
              <th className="px-6 py-3 text-right font-bold text-blue-600 dark:text-blue-400">Period A</th>
              <th className="px-6 py-3 text-right font-bold">Period B</th>
              <th className="px-6 py-3 text-right font-bold">Change</th>
              <th className="px-6 py-3 text-right font-bold w-28">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No data for these ranges.
                </td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr key={r.key} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10">
                  <td className="px-6 py-3">
                    <div className="max-w-[420px]">
                      <div className="truncate font-medium text-gray-700 dark:text-gray-300" title={r.label}>
                        {r.label}
                      </div>
                      {r.sublabel && (
                        <div className="text-[11px] text-gray-400 truncate">{r.sublabel}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {r.a.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 tabular-nums">
                    {r.b.toLocaleString()}
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 text-right font-bold tabular-nums",
                      r.delta > 0 ? "text-green-600 dark:text-green-400" : r.delta < 0 ? "text-red-600 dark:text-red-400" : "text-gray-400",
                    )}
                  >
                    {r.delta > 0 ? "+" : ""}
                    {r.delta.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <DeltaBadge pct={r.pct} delta={r.delta} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button
          onClick={() => setLimit((l) => l + 50)}
          className="w-full py-3 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-t border-gray-100 dark:border-gray-800"
        >
          Show more ({rows.length - limit} remaining)
        </button>
      )}
    </div>
  );
}

/**
 * Side-by-side comparison of two arbitrary date ranges.
 *
 * Lives in its own tab and reuses the existing endpoints, so the default traffic
 * view is untouched by it.
 */
export function CompareView({ platform }: { platform: TrafficPlatformKey }) {
  const {
    rangeA,
    setRangeA,
    rangeB,
    setRangeB,
    applyPreset,
    metrics,
    pageRows,
    landingRows,
    loading,
  } = useCompareData(platform);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-wrap gap-4 items-stretch">
          <RangePicker label="Period A" tone="a" range={rangeA} onChange={setRangeA} />
          <RangePicker label="Period B" tone="b" range={rangeB} onChange={setRangeB} />
          <div className="flex flex-col justify-center gap-2 min-w-[150px]">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              Set B relative to A
            </span>
            <div className="flex flex-wrap gap-2">
              {([
                ["prevPeriod", "Prev period"],
                ["prevWeek", "-1 week"],
                ["prevMonth", "-4 weeks"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-6">
        {loading && (
          <div className="absolute inset-0 z-50 bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg flex items-center gap-3 border border-gray-100 dark:border-gray-800">
              <RefreshCcw className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="font-bold text-gray-900 dark:text-white">Comparing…</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {m.label}
                </span>
                <DeltaBadge pct={m.pct} delta={m.delta} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {m.a.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                vs {m.b.toLocaleString()} in Period B ({m.delta > 0 ? "+" : ""}
                {m.delta.toLocaleString()})
              </p>
            </div>
          ))}
        </div>

        <ComparisonTable
          title="By Page"
          subtitle={`${getPlatform(platform).label} sessions per mapped page, Period A vs B`}
          rows={pageRows}
          labelHeader="Page"
        />

        <ComparisonTable
          title="By Landing Page"
          subtitle="Sessions per article — works for untagged organic traffic"
          rows={landingRows}
          labelHeader="Landing page"
        />
      </div>
    </div>
  );
}
