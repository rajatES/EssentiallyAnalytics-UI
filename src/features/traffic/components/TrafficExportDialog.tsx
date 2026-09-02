"use client";

import { useEffect, useState } from "react";
import { Download, X, LayoutList, ListTree, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

import type { TrafficExportMode } from "../trafficCsv";

interface Props {
  open: boolean;
  onClose: () => void;
  onExport: (mode: TrafficExportMode) => void;
  /** Whichever dimension the table is grouped by right now. */
  viewMode: "category" | "team";
  groupCount: number;
  pageCount: number;
  /** Pages that would be written by `asShown` (0 when everything is collapsed). */
  expandedPageCount: number;
  dateCount: number;
  /** Metric the daily columns carry, e.g. "sessions". */
  metricLabel: string;
}

export function TrafficExportDialog({
  open,
  onClose,
  onExport,
  viewMode,
  groupCount,
  pageCount,
  expandedPageCount,
  dateCount,
  metricLabel,
}: Props) {
  const [mode, setMode] = useState<TrafficExportMode>("asShown");

  // Escape closes, like the other panels on this page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isTeamView = viewMode === "team";
  const Group = isTeamView ? "Team" : "Category";
  const one = isTeamView ? "team" : "category";
  const many = isTeamView ? "teams" : "categories";
  const dailyNote = dateCount
    ? `${dateCount} daily ${metricLabel} column${dateCount === 1 ? "" : "s"}`
    : "no daily columns for this range";

  const options: Array<{
    value: TrafficExportMode;
    icon: typeof Table2;
    title: string;
    detail: string;
    rows: string;
  }> = [
      {
        value: "asShown",
        icon: Table2,
        title: "Exactly as shown in the table",
        detail: `Mirrors what's on screen right now — collapsed ${many} stay collapsed — plus ${dailyNote}.`,
        rows: expandedPageCount
          ? `${groupCount} ${many} + ${expandedPageCount} expanded page${expandedPageCount === 1 ? "" : "s"}`
          : `${groupCount} ${many} (all collapsed)`,
      },
      {
        value: "full",
        icon: ListTree,
        title: "Full detail — every page, nested",
        detail: `Every ${one} with all of its pages indented underneath, including Other and Unassigned, plus ${dailyNote}.`,
        rows: `${groupCount} ${many} + ${pageCount} page${pageCount === 1 ? "" : "s"}`,
      },
      {
        value: "summary",
        icon: LayoutList,
        title: `${Group} totals only`,
        detail: `One aggregate row per ${one}, no pages and no daily columns.`,
        rows: `${groupCount} ${many}`,
      },
    ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Export CSV"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Export CSV
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Pick how much of the breakdown to include.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-2 overflow-y-auto p-5">
          {options.map((opt) => {
            const selected = mode === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                onDoubleClick={() => onExport(opt.value)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected
                    ? "border-green-500 bg-green-50/60 ring-1 ring-green-500/30 dark:border-green-600 dark:bg-green-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 rounded-lg border p-1.5",
                    selected
                      ? "border-green-500/40 bg-white text-green-600 dark:border-green-600/40 dark:bg-gray-900 dark:text-green-400"
                      : "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                      {opt.title}
                    </span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {opt.rows}
                    </span>
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {opt.detail}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Engagement rates export as fractions (0.55 = 55%).
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onExport(mode)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
