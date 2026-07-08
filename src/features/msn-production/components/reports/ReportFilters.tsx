"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search, Filter, X, Globe } from "lucide-react";
import { regionTierHint } from "./eod/helpers";

export interface FeedOption {
  name: string; // full publication name (the filter value)
  shortName: string;
  tier: string;
}

interface Props {
  feeds: FeedOption[];
  /** Feed-tier keys available in the data (T1/T2/T3). Feed-level filter. */
  feedTiers: string[];
  selectedFeeds: string[];
  selectedTiers: string[];
  onToggleFeed: (name: string) => void;
  onToggleTier: (tier: string) => void;
  onClear: () => void;
  /** Region-tier definitions (tier → region codes). Views-only filter. */
  regionTiersMap: Record<string, string[]>;
  /** Selected region tier, or null for "All regions". */
  regionTier: string | null;
  onSelectRegionTier: (t: string | null) => void;
  /** Region tier only applies to the EOD report (per-region views). */
  showRegionTier: boolean;
}

export default function ReportFilters({
  feeds,
  feedTiers,
  selectedFeeds,
  selectedTiers,
  onToggleFeed,
  onToggleTier,
  onClear,
  regionTiersMap,
  regionTier,
  onSelectRegionTier,
  showRegionTier,
}: Props) {
  const hasFilters =
    selectedFeeds.length > 0 || selectedTiers.length > 0 || regionTier != null;
  const regionKeys = Object.keys(regionTiersMap);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
        <Filter size={13} />
        Filters
      </span>

      {/* Region-tier pills — filters VIEWS only (EOD). */}
      {showRegionTier && regionKeys.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500"
            title="Filters view counts to a group of countries. Leaves Published, targets and feed health unchanged."
          >
            <Globe size={12} />
            Region
          </span>
          <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            <RegionPill
              label="All"
              active={regionTier == null}
              onClick={() => onSelectRegionTier(null)}
              title="All regions"
            />
            {regionKeys.map((t) => (
              <RegionPill
                key={t}
                label={t}
                active={regionTier === t}
                onClick={() => onSelectRegionTier(regionTier === t ? null : t)}
                title={`${t} · ${regionTierHint(regionTiersMap[t])}`}
              />
            ))}
          </div>
        </div>
      )}

      <FeedDropdown
        feeds={feeds}
        feedTiers={feedTiers}
        selected={selectedFeeds}
        selectedTiers={selectedTiers}
        onToggle={onToggleFeed}
        onToggleTier={onToggleTier}
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

function RegionPill({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/** Label for the tier group rows, e.g. "Tier 1 feeds". */
function tierGroupLabel(tier: string): string {
  const n = tier.replace(/^T/i, "");
  return /^\d+$/.test(n) ? `Tier ${n} feeds` : `${tier} feeds`;
}

function feedButtonLabel(selectedTiers: string[], feedCount: number): string {
  const parts: string[] = [];
  if (selectedTiers.length) {
    parts.push([...selectedTiers].sort().join(" + "));
  }
  if (feedCount) {
    parts.push(`${feedCount} feed${feedCount > 1 ? "s" : ""}`);
  }
  return parts.length ? parts.join(" · ") : "All feeds";
}

function FeedDropdown({
  feeds,
  feedTiers,
  selected,
  selectedTiers,
  onToggle,
  onToggleTier,
}: {
  feeds: FeedOption[];
  feedTiers: string[];
  selected: string[];
  selectedTiers: string[];
  onToggle: (name: string) => void;
  onToggleTier: (tier: string) => void;
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
  const active = count > 0 || selectedTiers.length > 0;
  const label = feedButtonLabel(selectedTiers, count);

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
          active
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
          {/* Feed-tier groups — subset the dataset to whole tiers of feeds. */}
          {feedTiers.length > 0 && (
            <div className="border-b border-gray-100 p-1 dark:border-gray-800">
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Feed tiers
              </p>
              {feedTiers.map((t) => {
                const isActive = selectedTiers.includes(t);
                const n = feeds.filter((f) => f.tier === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => onToggleTier(t)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isActive
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isActive && (
                        <Check size={10} strokeWidth={3} className="text-white" />
                      )}
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {tierGroupLabel(t)}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-300 dark:text-gray-600">
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
                const isActive = selected.includes(f.name);
                return (
                  <button
                    key={f.name}
                    onClick={() => onToggle(f.name)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isActive
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isActive && (
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
