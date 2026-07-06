"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Timer,
  Users,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  Calendar,
  Check,
} from "lucide-react";
import type { SyncStatus } from "../types";

export type MsnTab =
  | "overview"
  | "production"
  | "stages"
  | "people"
  | "insights"
  | "moderation";
export type RangeKey = "7d" | "14d" | "30d" | "90d" | "all" | "custom";

const TABS = [
  { key: "overview" as MsnTab, label: "Overview", icon: LayoutDashboard },
  { key: "production" as MsnTab, label: "Production", icon: ClipboardList },
  { key: "stages" as MsnTab, label: "Stages", icon: Timer },
  { key: "people" as MsnTab, label: "People", icon: Users },
  { key: "insights" as MsnTab, label: "Insights", icon: Sparkles },
  { key: "moderation" as MsnTab, label: "Moderation", icon: ShieldCheck },
];

const RANGE_PRESETS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "14d", label: "14D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

interface Props {
  tab: MsnTab;
  onTab: (t: MsnTab) => void;
  range: RangeKey;
  onRange: (r: RangeKey) => void;
  customStart?: string;
  customEnd?: string;
  onCustomRange: (start: string, end: string) => void;
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (c: string) => void;
  onClearCategories: () => void;
  syncStatus?: SyncStatus;
  onSync: () => void;
  isSyncing: boolean;
  showSync: boolean;
}

function lastSyncLabel(iso: string | null | undefined): string {
  if (!iso) return "never synced";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "synced just now";
  if (mins < 60) return `synced ${mins}m ago`;
  return `synced ${Math.round(mins / 60)}h ago`;
}

// ─── Category multi-select dropdown ──────────────────────────────────────────

interface CategoryDropdownProps {
  categories: string[];
  selected: string[];
  onToggle: (c: string) => void;
  onClear: () => void;
}

function CategoryDropdown({ categories, selected, onToggle, onClear }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const count = selected.length;
  const label = count === 0 ? "All Divisions" : `${count} Division${count > 1 ? "s" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          count > 0
            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white"
        }`}
      >
        {label}
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[220px] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {categories.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-400">No categories loaded</p>
          ) : (
            <div className="max-h-64 overflow-y-auto p-1">
              {categories.map((c) => {
                const active = selected.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => onToggle(c)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        active
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {active && (
                        <Check size={10} strokeWidth={3} className="text-white" />
                      )}
                    </span>
                    {c}
                  </button>
                );
              })}
            </div>
          )}
          {count > 0 && (
            <div className="border-t border-gray-100 p-1 dark:border-gray-800">
              <button
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 hover:text-rose-500 dark:hover:bg-gray-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Custom date range picker ─────────────────────────────────────────────────

interface DateRangePickerProps {
  customStart?: string;
  customEnd?: string;
  onApply: (start: string, end: string) => void;
  onClose: () => void;
}

function DateRangePicker({ customStart, customEnd, onApply, onClose }: DateRangePickerProps) {
  const [start, setStart] = useState(customStart ?? "");
  const [end, setEnd] = useState(customEnd ?? "");
  const today = new Date().toISOString().slice(0, 10);

  const valid = !!start && !!end && start <= end;

  return (
    <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <Calendar size={13} className="text-indigo-500" />
        Custom date range
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400 dark:text-gray-500">
            From
          </label>
          <input
            type="date"
            value={start}
            max={end || today}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400 dark:text-gray-500">
            To
          </label>
          <input
            type="date"
            value={end}
            min={start}
            max={today}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-indigo-500"
          />
        </div>
      </div>
      {start && end && !valid && (
        <p className="mt-2 text-[11px] text-rose-500">Start date must be before end date.</p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (valid) {
              onApply(start, end);
              onClose();
            }
          }}
          disabled={!valid}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Main header ──────────────────────────────────────────────────────────────

export default function MsnHeader({
  tab,
  onTab,
  range,
  onRange,
  customStart,
  customEnd,
  onCustomRange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  syncStatus,
  onSync,
  isSyncing,
  showSync,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const customRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDatePicker) return;
    const handler = (e: MouseEvent) => {
      if (customRef.current && !customRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDatePicker]);

  function handleRangeClick(key: RangeKey) {
    if (key === "custom") {
      setShowDatePicker((o) => !o);
      return;
    }
    setShowDatePicker(false);
    onRange(key);
  }

  const customLabel =
    range === "custom" && customStart && customEnd
      ? `${customStart.slice(5).replace("-", "/")} – ${customEnd.slice(5).replace("-", "/")}`
      : "Custom";

  return (
    <div className="space-y-3">
      {/* Row 1 — tabs + sync */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncStatus?.error
                  ? "bg-rose-500"
                  : syncStatus?.syncing
                    ? "animate-pulse bg-amber-400"
                    : "bg-emerald-500"
              }`}
            />
            {syncStatus?.syncing ? "syncing…" : lastSyncLabel(syncStatus?.lastSyncTime)}
          </span>
          {showSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              Sync
            </button>
          )}
        </div>
      </div>

      {/* Row 2 — date range + category dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Preset range pills + custom */}
        <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {RANGE_PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleRangeClick(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}

          {/* Custom button + picker */}
          <div ref={customRef} className="relative">
            <button
              onClick={() => handleRangeClick("custom")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === "custom"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Calendar size={11} />
              {customLabel}
            </button>

            {showDatePicker && (
              <DateRangePicker
                customStart={customStart}
                customEnd={customEnd}
                onApply={(s, e) => {
                  onCustomRange(s, e);
                  onRange("custom");
                }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Category multi-select dropdown */}
        <CategoryDropdown
          categories={categories}
          selected={selectedCategories}
          onToggle={onToggleCategory}
          onClear={onClearCategories}
        />
      </div>
    </div>
  );
}
