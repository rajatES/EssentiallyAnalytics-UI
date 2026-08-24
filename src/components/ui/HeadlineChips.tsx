"use client";

import { CalendarDays, CalendarRange, Clock, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDayLabel, formatRangeLabel } from "@/lib/periods";
import type { HeadlineWindow, HeadlineWindows } from "@/types";

interface Props {
  windows: HeadlineWindows | null;
  /** Lowercase noun for the number — "sessions", "impressions". Omit where the
   *  formatted value already says what it is, such as currency. */
  metricLabel?: string;
  loading?: boolean;
  formatValue?: (n: number) => string;
}

type ChipKey = "mtd" | "dod" | "wow";

const CHIPS: Array<{ key: ChipKey; short: string; title: string; icon: LucideIcon }> = [
  { key: "mtd", short: "MTD", title: "Month to date", icon: CalendarRange },
  { key: "dod", short: "DOD", title: "Day over day", icon: Clock },
  { key: "wow", short: "WOW", title: "Week over week", icon: CalendarDays },
];

/** A single day reads as a date, a span as a range. */
function spanLabel(start: string, end: string) {
  return start === end ? formatDayLabel(start) : formatRangeLabel(start, end);
}

function DiffPill({ diff }: { diff: number | null }) {
  if (diff === null) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
        new
      </span>
    );
  }

  const flat = Math.abs(diff) < 0.05;
  const up = diff > 0;

  return (
    <span
      className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap",
        flat
          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          : up
            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
      )}
    >
      {!flat &&
        (up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
      {flat ? "" : up ? "+" : "-"}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

function Chip({
  short,
  title,
  icon: Icon,
  window: w,
  metricLabel,
  formatValue,
}: {
  short: string;
  title: string;
  icon: LucideIcon;
  window: HeadlineWindow;
  metricLabel?: string;
  formatValue: (n: number) => string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
          <Icon className="w-4 h-4 shrink-0" />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
            title={title}
          >
            {short}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {spanLabel(w.start, w.end)}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {formatValue(w.value)}
          {metricLabel && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {" "}
              {metricLabel}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
          vs {formatValue(w.prevValue)}
          <span className="text-gray-500 dark:text-gray-400">
            {" · "}
            {spanLabel(w.prevStart, w.prevEnd)}
          </span>
        </p>
      </div>
      <DiffPill diff={w.diff} />
    </div>
  );
}

/**
 * The MTD / DOD / WOW headline chips, each carrying the value it compares
 * against rather than the percentage alone.
 *
 * Rendered as a fragment of three cards so the host page owns the grid and can
 * sit its own extra card in the same row. All three windows are anchored on the
 * newest day with data, not on the page's date picker — the spans are labelled
 * so that stays visible.
 */
export function HeadlineChips({
  windows,
  metricLabel,
  loading,
  formatValue = (n) => Math.round(n).toLocaleString("en-US"),
}: Props) {
  if (loading || !windows) {
    return (
      <>
        {CHIPS.map(({ key, short, icon: Icon }) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {short}
              </span>
            </div>
            {loading ? (
              <div className="h-6 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : (
              // Distinct from the skeleton on purpose: a failed or empty fetch
              // should not pulse as though it were still on its way.
              <div className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                No data yet
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {CHIPS.map(({ key, short, title, icon }) => {
        const w = windows[key];
        if (!w) return null;
        return (
          <Chip
            key={key}
            short={short}
            title={title}
            icon={icon}
            window={w}
            metricLabel={metricLabel}
            formatValue={formatValue}
          />
        );
      })}
    </>
  );
}
