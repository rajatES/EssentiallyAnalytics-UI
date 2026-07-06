"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search, Filter, X } from "lucide-react";

export interface FeedOption {
  name: string; // full publication name (the filter value)
  shortName: string;
  tier: string;
}

interface Props {
  feeds: FeedOption[];
  tiers: string[];
  selectedFeeds: string[];
  selectedTiers: string[];
  onToggleFeed: (name: string) => void;
  onToggleTier: (tier: string) => void;
  onClear: () => void;
}

export default function ReportFilters({
  feeds,
  tiers,
  selectedFeeds,
  selectedTiers,
  onToggleFeed,
  onToggleTier,
  onClear,
}: Props) {
  const hasFilters = selectedFeeds.length > 0 || selectedTiers.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
        <Filter size={13} />
        Filters
      </span>

      {/* Tier chips */}
      {tiers.length > 0 && (
        <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {tiers.map((t) => {
            const active = selectedTiers.includes(t);
            return (
              <button
                key={t}
                onClick={() => onToggleTier(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      <FeedDropdown
        feeds={feeds}
        selected={selectedFeeds}
        onToggle={onToggleFeed}
      />

      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-rose-500"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}

function FeedDropdown({
  feeds,
  selected,
  onToggle,
}: {
  feeds: FeedOption[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
  const label = count === 0 ? "All feeds" : `${count} feed${count > 1 ? "s" : ""}`;

  const filtered = feeds.filter(
    (f) =>
      f.shortName.toLowerCase().includes(query.toLowerCase()) ||
      f.name.toLowerCase().includes(query.toLowerCase()),
  );

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
        <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
              <Search size={12} className="text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search feeds…"
                className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none dark:text-gray-300"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              No feeds
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.map((f) => {
                const active = selected.includes(f.name);
                return (
                  <button
                    key={f.name}
                    onClick={() => onToggle(f.name)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
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
                    <span className="flex-1 truncate" title={f.name}>
                      {f.shortName}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-300 dark:text-gray-600">
                      {f.tier}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
