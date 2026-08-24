"use client";

import { useMemo } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { residualRank } from "@/lib/groupOrder";
import { DeltaLabel } from "./DeltaLabel";
import { TableCsvButton } from "./TableCsvButton";

export interface PeriodComparisonRow {
  label: string;
  periodCurrent: number;
  periodPrevious: number;
  dayCurrent: number;
  dayPrevious: number;
}

export interface MetricOption {
  key: string;
  label: string;
}

interface Props {
  rows: PeriodComparisonRow[];
  /** Header for the label column — "Category", "Sport", "Team". */
  rowHeader: string;
  /** Human range labels for the four value columns. */
  periodLabel: string;
  prevPeriodLabel: string;
  dayLabel: string;
  prevDayLabel: string;
  title?: string;
  subtitle?: string;
  csvFilename: string;
  loading?: boolean;
  formatValue?: (n: number) => string;
  metricOptions?: MetricOption[];
  activeMetric?: string;
  onMetricChange?: (key: string) => void;
}

/** null pct = "no baseline", which DeltaLabel renders as "new". */
function pct(current: number, previous: number): number | null {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? null : 0;
}

/**
 * Compact period-over-period summary: one row per group, the selected range
 * against the range before it, and the latest day against the day before it.
 *
 * Both comparisons show the value being measured against, not just the
 * percentage — a drop of 40% reads very differently from 50 than from 50,000.
 */
export function PeriodComparisonTable({
  rows,
  rowHeader,
  periodLabel,
  prevPeriodLabel,
  dayLabel,
  prevDayLabel,
  title = "Period Comparison",
  subtitle,
  csvFilename,
  loading,
  // Locale is pinned: bare toLocaleString() resolves to en-IN under Node and
  // en-US in the browser, so grouping differs and hydration fails.
  formatValue = (n) => Math.round(n).toLocaleString("en-US"),
  metricOptions,
  activeMetric,
  onMetricChange,
}: Props) {
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const rank = residualRank(a.label) - residualRank(b.label);
        return rank !== 0 ? rank : b.periodCurrent - a.periodCurrent;
      }),
    [rows],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          periodCurrent: acc.periodCurrent + r.periodCurrent,
          periodPrevious: acc.periodPrevious + r.periodPrevious,
          dayCurrent: acc.dayCurrent + r.dayCurrent,
          dayPrevious: acc.dayPrevious + r.dayPrevious,
        }),
        { periodCurrent: 0, periodPrevious: 0, dayCurrent: 0, dayPrevious: 0 },
      ),
    [rows],
  );

  const groupHead =
    "px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider";
  const colHead = "px-3 py-2 text-right font-semibold whitespace-nowrap";
  const cell = "px-3 py-2.5 text-right tabular-nums whitespace-nowrap";
  const groupEdge = "border-l border-gray-200 dark:border-gray-700";

  const valueCells = (
    row: Pick<
      PeriodComparisonRow,
      "periodCurrent" | "periodPrevious" | "dayCurrent" | "dayPrevious"
    >,
    strong: boolean,
  ) => (
    <>
      <td
        className={cn(
          cell,
          groupEdge,
          strong
            ? "font-bold text-gray-900 dark:text-white"
            : "font-semibold text-gray-800 dark:text-gray-100",
        )}
      >
        {formatValue(row.periodCurrent)}
      </td>
      <td className={cn(cell, "text-gray-500 dark:text-gray-400")}>
        {formatValue(row.periodPrevious)}
      </td>
      <td className={cell}>
        <DeltaLabel
          pct={pct(row.periodCurrent, row.periodPrevious)}
          baseline={row.periodPrevious}
          signed
          className="justify-end"
        />
      </td>
      <td
        className={cn(
          cell,
          groupEdge,
          strong
            ? "font-bold text-gray-900 dark:text-white"
            : "font-semibold text-gray-800 dark:text-gray-100",
        )}
      >
        {formatValue(row.dayCurrent)}
      </td>
      <td className={cn(cell, "text-gray-500 dark:text-gray-400")}>
        {formatValue(row.dayPrevious)}
      </td>
      <td className={cell}>
        <DeltaLabel
          pct={pct(row.dayCurrent, row.dayPrevious)}
          baseline={row.dayPrevious}
          signed
          className="justify-end"
        />
      </td>
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              {title}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {subtitle ?? `${periodLabel} vs ${prevPeriodLabel}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metricOptions && metricOptions.length > 1 && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              {metricOptions.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onMetricChange?.(m.key)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all",
                    activeMetric === m.key
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
          <TableCsvButton filename={csvFilename} />
        </div>
      </div>

      <div className="overflow-auto max-h-[560px]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/95 backdrop-blur-md text-gray-500 dark:text-gray-400">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="bg-gray-50 dark:bg-gray-800" />
              <th
                colSpan={3}
                className={cn(
                  groupHead,
                  groupEdge,
                  "bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                )}
              >
                Selected period
              </th>
              <th
                colSpan={3}
                className={cn(
                  groupHead,
                  groupEdge,
                  "bg-violet-50/70 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
                )}
              >
                Latest day
              </th>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2 text-left font-semibold tracking-wider bg-gray-50 dark:bg-gray-800">
                {rowHeader}
              </th>
              <th className={cn(colHead, groupEdge)}>{periodLabel}</th>
              <th className={colHead}>{prevPeriodLabel}</th>
              <th className={colHead}>Change</th>
              <th className={cn(colHead, groupEdge)}>{dayLabel}</th>
              <th className={colHead}>{prevDayLabel}</th>
              <th className={colHead}>Change</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading comparison…
                </td>
              </tr>
            ) : !sorted.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No data for the selected range yet.
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={row.label}
                  className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <td className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">
                    {row.label}
                  </td>
                  {valueCells(row, false)}
                </tr>
              ))
            )}
          </tbody>

          {!loading && sorted.length > 0 && (
            <tfoot className="sticky bottom-0">
              <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
                <td className="px-4 py-3 font-bold uppercase tracking-wide text-[11px] text-gray-700 dark:text-gray-200">
                  Total
                </td>
                {valueCells(totals, true)}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
