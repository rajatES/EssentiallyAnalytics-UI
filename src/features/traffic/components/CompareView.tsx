"use client";

import { useState } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Calendar,
  MousePointer2,
  Users,
  Eye,
  Activity,
  Download,
  RefreshCcw,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { DeltaLabel } from "@/components/ui/DeltaLabel";
import { downloadRowsCsv } from "@/lib/tableCsv";
import { getPlatform, type TrafficPlatformKey } from "@/lib/traffic-platforms";
import {
  useCompareData,
  type ComparedRow,
  type DateRange,
  type MetricSet,
} from "../hooks/useCompareData";

const STAT_ICONS = {
  sessions: MousePointer2,
  users: Users,
  pageviews: Eye,
  engagement: Activity,
} as const;

const STAT_COLORS = {
  sessions: "bg-blue-500",
  users: "bg-indigo-500",
  pageviews: "bg-emerald-500",
  engagement: "bg-amber-500",
} as const;

/** Inclusive day count for a range, or 0 if either date is unparseable. */
function rangeDays(range: DateRange): number {
  try {
    return differenceInCalendarDays(parseISO(range.end), parseISO(range.start)) + 1;
  } catch {
    return 0;
  }
}

function rangeLabel(range: DateRange): string {
  try {
    return `${format(parseISO(range.start), "d MMM")} – ${format(parseISO(range.end), "d MMM")}`;
  } catch {
    return "—";
  }
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
  const days = rangeDays(range);
  return (
    <div
      className={cn(
        "flex-1 min-w-[240px] rounded-lg border p-2",
        tone === "a"
          ? "border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20"
          : "border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            tone === "a" ? "bg-blue-600 text-white" : "bg-gray-500 text-white",
          )}
        >
          {label}
        </span>
        {/* Day count makes the size of the window being summed explicit. */}
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
          {days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "invalid range"}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="date"
          value={range.start}
          onChange={(e) => onChange({ ...range, start: e.target.value })}
          className="bg-transparent text-xs outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer w-[122px]"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => onChange({ ...range, end: e.target.value })}
          className="bg-transparent text-xs outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer w-[122px]"
        />
      </div>
    </div>
  );
}

/** A table cell: Period A's value, the change, then Period B's value beneath. */
function MetricCell({
  a,
  b,
  colorClass,
  percent,
}: {
  a: number;
  b: number;
  colorClass: string;
  percent?: boolean;
}) {
  const pct = !b ? (a ? null : 0) : ((a - b) / b) * 100;
  const fmt = (n: number) => (percent ? `${(n * 100).toFixed(1)}%` : n.toLocaleString());
  return (
    <td className="px-4 py-2 text-right align-top">
      <div className={cn("font-semibold tabular-nums", colorClass)}>{fmt(a)}</div>
      <div className="flex justify-end mt-0.5">
        <DeltaLabel pct={pct} delta={a - b} baseline={b} />
      </div>
      <div className="text-[10px] text-gray-400 tabular-nums mt-0.5">was {fmt(b)}</div>
    </td>
  );
}

function ComparisonTable({
  title,
  subtitle,
  icon: Icon,
  rows,
  labelHeader,
  showEngagement,
  csvName,
}: {
  title: string;
  subtitle: string;
  icon: typeof BarChart3;
  rows: ComparedRow[];
  labelHeader: string;
  showEngagement?: boolean;
  csvName: string;
}) {
  const [limit, setLimit] = useState(25);
  const shown = rows.slice(0, limit);

  // Column labels name the aggregation ("Total Sessions", not "Sessions"), the
  // same wording the Overview table uses. Without it a reader can't tell whether
  // a number is a period total, a daily peak, or an average.
  const cols: Array<[keyof MetricSet, string, string, string, boolean]> = [
    ["sessions", "Total", "Sessions", "text-blue-600 dark:text-blue-400", false],
    ["users", "Total", "Users", "text-gray-600 dark:text-gray-400", false],
    ["pageviews", "Total", "Views", "text-gray-600 dark:text-gray-400", false],
  ];
  if (showEngagement) {
    cols.push(["engagement", "Avg", "Eng. Rate", "text-gray-600 dark:text-gray-400", true]);
  }

  const handleExport = () =>
    downloadRowsCsv(
      [
        labelHeader,
        "Group",
        ...cols.flatMap(([, agg, label]) => [`${agg} ${label} (A)`, `${agg} ${label} (B)`, `${label} Δ%`]),
      ],
      rows.map((r) => [
        r.label,
        r.sublabel ?? "",
        ...cols.flatMap(([key]) => {
          const a = r.a[key];
          const b = r.b[key];
          const pct = !b ? (a ? "new" : "0.00") : (((a - b) / b) * 100).toFixed(2);
          return [a, b, pct];
        }),
      ]),
      csvName,
    );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={!rows.length}
          className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2.5 font-semibold tracking-wider">{labelHeader}</th>
              {cols.map(([key, agg, label]) => (
                <th key={key} className="px-4 py-2.5 text-right font-semibold min-w-[100px]">
                  {agg}
                  <br />
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!rows.length ? (
              <tr>
                <td colSpan={cols.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No data for these ranges.
                </td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr key={r.key} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10">
                  <td className="px-4 py-2 align-top">
                    <div className="max-w-[380px]">
                      <div
                        className="truncate text-gray-700 dark:text-gray-300"
                        title={r.label}
                      >
                        {r.label}
                      </div>
                      {r.sublabel && (
                        <div className="text-[10px] text-gray-400 truncate">{r.sublabel}</div>
                      )}
                    </div>
                  </td>
                  {cols.map(([key, , , color, percent]) => (
                    <MetricCell
                      key={key}
                      a={r.a[key]}
                      b={r.b[key]}
                      colorClass={color}
                      percent={percent}
                    />
                  ))}
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
 * Compare tab: the Overview layout, with each metric carrying its change against
 * a second period directly underneath. Reuses StatCard and the same chart shape
 * as Overview so the two tabs read identically.
 */
export function CompareView({ platform }: { platform: TrafficPlatformKey }) {
  const {
    rangeA,
    setRangeA,
    rangeB,
    setRangeB,
    applyPreset,
    metrics,
    chartData,
    pageRows,
    loading,
  } = useCompareData(platform);

  const statValue = (key: string, value: number) =>
    key === "engagement" ? `${(value * 100).toFixed(2)}%` : value.toLocaleString();

  const daysA = rangeDays(rangeA);
  const daysB = rangeDays(rangeB);
  // Totals over windows of different lengths aren't comparable — a 30-day period
  // will always "beat" a 7-day one. Say so rather than letting it read as growth.
  const lengthMismatch = daysA > 0 && daysB > 0 && daysA !== daysB;
  const periodNote = `${rangeLabel(rangeA)} (${daysA}d) vs ${rangeLabel(rangeB)} (${daysB}d)`;

  // Recharts hands the payload over as a readonly array, so the prop type has to
  // match or TS rejects the content renderer.
  const chartTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: readonly { name?: string; value?: number; color?: string }[];
    label?: string | number;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs font-medium mb-1"
            style={{ color: entry.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>
              {entry.name}: {(entry.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-row flex-wrap items-stretch gap-3 w-full xl:w-auto">
          <RangePicker label="Period A" tone="a" range={rangeA} onChange={setRangeA} />
          <RangePicker label="Period B" tone="b" range={rangeB} onChange={setRangeB} />
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
            Set B relative to A
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["prevPeriod", "Prev period"],
                ["prevWeek", "-1 week"],
                ["prevMonth", "-4 weeks"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="whitespace-nowrap px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {lengthMismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-200">
            <span className="font-semibold">
              Period A is {daysA} days, Period B is {daysB} days.
            </span>{" "}
            The tables below show period <em>totals</em>, so the longer period will
            look larger regardless of performance. Use &ldquo;Prev period&rdquo; to
            match the lengths.
          </p>
        </div>
      )}

      <div className="relative space-y-4">
        {loading && (
          <div className="absolute inset-0 z-50 bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg flex items-center gap-3 border border-gray-100 dark:border-gray-800">
              <RefreshCcw className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="font-bold text-gray-900 dark:text-white">Comparing…</span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-500 dark:text-gray-400 -mb-1">
          Showing <span className="font-semibold">Period A totals</span> ({rangeLabel(rangeA)}),
          with the change against Period B ({rangeLabel(rangeB)}) beneath each figure.
          Engagement is a period average, not a total.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <StatCard
              key={m.key}
              title={m.label}
              value={statValue(m.key, m.a)}
              icon={STAT_ICONS[m.key]}
              colorClass={STAT_COLORS[m.key]}
              loading={loading}
              delta={{ pct: m.pct, delta: m.delta, baseline: m.b }}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
            Sessions Trend
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Aligned by position in each range, so equal-length periods line up day for day
          </p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cmpA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" strokeOpacity={0.2} />
                <Tooltip content={chartTooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="periodB"
                  name="Period B"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="periodA"
                  name="Period A"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#cmpA)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ComparisonTable
          title="Detailed Breakdown"
          subtitle={`${getPlatform(platform).label} · period totals per mapped page · ${periodNote}`}
          icon={BarChart3}
          rows={pageRows}
          labelHeader="Category / Page Name"
          showEngagement
          csvName="compare-by-page"
        />
      </div>
    </div>
  );
}
