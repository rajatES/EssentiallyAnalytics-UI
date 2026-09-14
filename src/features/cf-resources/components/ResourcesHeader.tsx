"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, Sliders, UserSearch } from "lucide-react";
import type { ResourceStatus } from "@/features/critical-flow/types";
import StatusChip, { STATUS_ORDER } from "./StatusChip";

export type RoleFilter = "all" | "writer" | "editor";

interface Props {
  date: string;
  onDate: (d: string) => void;
  today: string;
  weekday?: string;
  currentShift?: string;
  divisions: string[];
  selectedDivisions: string[];
  onToggleDivision: (d: string) => void;
  onClearDivisions: () => void;
  role: RoleFilter;
  onRole: (r: RoleFilter) => void;
  statuses: ResourceStatus[];
  onToggleStatus: (s: ResourceStatus) => void;
  counts?: Record<ResourceStatus, number>;
  query: string;
  onQuery: (q: string) => void;
  onFind: () => void;
  onEditQuotas: () => void;
  canEdit: boolean;
}

function DivisionDropdown({
  divisions,
  selected,
  onToggle,
  onClear,
}: {
  divisions: string[];
  selected: string[];
  onToggle: (d: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const n = selected.length;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          n
            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        }`}
      >
        {n === 0 ? "All Divisions" : `${n} Division${n > 1 ? "s" : ""}`}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[220px] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="max-h-64 overflow-y-auto p-1">
            {divisions.map((d) => (
              <button
                key={d}
                onClick={() => onToggle(d)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span className="truncate">{d}</span>
                {selected.includes(d) && <Check size={13} className="text-indigo-500" />}
              </button>
            ))}
          </div>
          {n > 0 && (
            <div className="border-t border-gray-100 p-1 dark:border-gray-800">
              <button
                onClick={onClear}
                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResourcesHeader(p: Props) {
  const isToday = !p.date || p.date === p.today;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* The page name lives in the Topbar; this says which day and shift
              the board is scored against, which changes as you pick dates. */}
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {p.weekday ? `${p.weekday} · ` : ""}
            {isToday ? "today" : p.date}
            {p.currentShift && isToday ? ` · ${p.currentShift} shift` : ""}
          </p>
          <input
            type="date"
            value={p.date || p.today}
            max={p.today}
            onChange={(e) => p.onDate(e.target.value === p.today ? "" : e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          {!isToday && (
            <button
              onClick={() => p.onDate("")}
              className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              back to today
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DivisionDropdown
            divisions={p.divisions}
            selected={p.selectedDivisions}
            onToggle={p.onToggleDivision}
            onClear={p.onClearDivisions}
          />
          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            {(["all", "writer", "editor"] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => p.onRole(r)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                  p.role === r
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {r === "all" ? "Everyone" : `${r}s`}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-700 dark:bg-gray-900">
            <Search size={12} className="text-gray-400" />
            <input
              value={p.query}
              onChange={(e) => p.onQuery(e.target.value)}
              placeholder="Find a person"
              className="w-32 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200"
            />
          </label>
          <button
            onClick={p.onFind}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <UserSearch size={13} />
            Find a resource
          </button>
          {p.canEdit && (
            <button
              onClick={p.onEditQuotas}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <Sliders size={12} />
              Quotas
            </button>
          )}
        </div>
      </div>

      {/* Status filter chips with live counts */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {STATUS_ORDER.map((s) => {
          const active = p.statuses.includes(s);
          const n = p.counts?.[s] ?? 0;
          return (
            <button
              key={s}
              onClick={() => p.onToggleStatus(s)}
              className={`rounded-lg border px-1.5 py-1 transition-colors ${
                active
                  ? "border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-500/40 dark:ring-indigo-500/20"
                  : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <StatusChip status={s} size="xs" />
                <span className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400">{n}</span>
              </span>
            </button>
          );
        })}
        {p.statuses.length > 0 && (
          <button
            onClick={() => p.statuses.forEach((s) => p.onToggleStatus(s))}
            className="ml-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
