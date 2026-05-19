import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X, RotateCcw, RefreshCw, CheckSquare, Square } from "lucide-react";
import type { FilterOptions, SyncStatus } from "../types";

interface Props {
  filterOptions: FilterOptions | undefined;
  syncStatus: SyncStatus | undefined;
  startDate: string;
  endDate: string;
  selectedBrands: string[];
  selectedFeeds: string[];
  selectedWriters: string[];
  selectedEditors: string[];
  selectedContentTypes: string[];
  selectedStatuses: string[];
  selectedAllotters: string[];
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onBrandsChange: (v: string[]) => void;
  onFeedsChange: (v: string[]) => void;
  onWritersChange: (v: string[]) => void;
  onEditorsChange: (v: string[]) => void;
  onContentTypesChange: (v: string[]) => void;
  onStatusesChange: (v: string[]) => void;
  onAllottersChange: (v: string[]) => void;
  onReset: () => void;
  onSync: () => void;
  isSyncing: boolean;
  showSync?: boolean;
}

interface DropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}

function MultiSelectDropdown({ label, options, selected, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const updatePos = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const panelWidth = 256;
      const viewportW = window.innerWidth;
      let left = rect.left;
      if (left + panelWidth > viewportW - 8) left = Math.max(8, viewportW - panelWidth - 8);
      setPos({ top: rect.bottom + 4, left });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
      setSearch("");
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  const allSelected = selected.length === options.length || selected.length === 0;
  const count = allSelected ? options.length : selected.length;
  const hasOptions = options.length > 0;

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const selectAll = () => onChange([]);
  const selectNone = () => onChange(options.length > 0 ? [options[0]] : []);

  const panel = open && pos && mounted ? createPortal(
    <div
      ref={panelRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: 256 }}
      className="z-[100] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      {options.length > 6 && (
        <div className="border-b border-gray-100 p-2 dark:border-gray-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={selectAll}
          className="flex-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-800"
        >
          All
        </button>
        <button
          onClick={selectNone}
          className="flex-1 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          None
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-gray-400">
            {options.length === 0 ? "No options available" : "No matches"}
          </p>
        ) : (
          filtered.map((item) => {
            const isSelected = allSelected || selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-50/50 font-semibold text-gray-900 dark:bg-indigo-900/20 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {isSelected ? (
                  <CheckSquare size={15} className="flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Square size={15} className="flex-shrink-0 text-gray-300 dark:text-gray-600" />
                )}
                <span className="truncate">{item}</span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => hasOptions && setOpen((o) => !o)}
        disabled={!hasOptions}
        className={`flex flex-shrink-0 items-center gap-1.5 min-w-[100px] justify-between rounded border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          !allSelected
            ? "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "border-gray-200 bg-white/60 text-gray-700 hover:bg-white/80 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700/80"
        }`}
      >
        <span className="truncate">
          {allSelected ? `All ${label}` : `${count} ${label}`}
        </span>
        <ChevronDown
          size={12}
          className={`flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {panel}
    </>
  );
}

export default function MsnFilterBar(props: Props) {
  const {
    filterOptions,
    syncStatus,
    startDate,
    endDate,
    selectedBrands,
    selectedFeeds,
    selectedWriters,
    selectedEditors,
    selectedContentTypes,
    selectedStatuses,
    selectedAllotters,
    onStartDateChange,
    onEndDateChange,
    onBrandsChange,
    onFeedsChange,
    onWritersChange,
    onEditorsChange,
    onContentTypesChange,
    onStatusesChange,
    onAllottersChange,
    onReset,
    onSync,
    isSyncing,
  } = props;

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedFeeds.length > 0 ||
    selectedWriters.length > 0 ||
    selectedEditors.length > 0 ||
    selectedContentTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedAllotters.length > 0;

  const activeTags: { label: string; onClear: () => void }[] = [];
  if (selectedBrands.length > 0 && selectedBrands.length !== (filterOptions?.brands.length ?? 0))
    activeTags.push({ label: `${selectedBrands.length} Brands`, onClear: () => onBrandsChange([]) });
  if (selectedFeeds.length > 0 && selectedFeeds.length !== (filterOptions?.feeds.length ?? 0))
    activeTags.push({ label: `${selectedFeeds.length} Feeds`, onClear: () => onFeedsChange([]) });
  if (selectedWriters.length > 0 && selectedWriters.length !== (filterOptions?.writers.length ?? 0))
    activeTags.push({ label: `${selectedWriters.length} Writers`, onClear: () => onWritersChange([]) });
  if (selectedEditors.length > 0 && selectedEditors.length !== (filterOptions?.editors.length ?? 0))
    activeTags.push({ label: `${selectedEditors.length} Editors`, onClear: () => onEditorsChange([]) });
  if (selectedContentTypes.length > 0 && selectedContentTypes.length !== (filterOptions?.contentTypes.length ?? 0))
    activeTags.push({ label: `${selectedContentTypes.length} Types`, onClear: () => onContentTypesChange([]) });
  if (selectedStatuses.length > 0 && selectedStatuses.length !== (filterOptions?.statuses.length ?? 0))
    activeTags.push({ label: `${selectedStatuses.length} Statuses`, onClear: () => onStatusesChange([]) });
  if (selectedAllotters.length > 0 && selectedAllotters.length !== (filterOptions?.allotters.length ?? 0))
    activeTags.push({ label: `${selectedAllotters.length} Allotters`, onClear: () => onAllottersChange([]) });

  const lastSyncLabel = syncStatus?.lastSyncTime
    ? `Synced ${formatTimeAgo(new Date(syncStatus.lastSyncTime))}`
    : "Not synced";

  return (
    <div className="sticky top-0 z-20">
      {/* ── Glass filter card ── */}
      <div className="rounded-b-xl border border-white/50 bg-white/70 shadow-[0_4px_20px_0_rgba(0,0,0,0.14)] backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/70 dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.45)]">
      {/* ── Main filter row ── */}
      <div className="flex items-center gap-2 px-3 py-3">

        {/* Left: scrollable filter controls */}
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="flex-shrink-0 rounded border border-gray-200 bg-white/60 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-800/60 dark:text-white"
          />
          <span className="flex-shrink-0 text-[10px] text-gray-400">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="flex-shrink-0 rounded border border-gray-200 bg-white/60 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-800/60 dark:text-white"
          />

          <div className="h-4 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-700" />

          {/* Dropdowns */}
          {filterOptions && (
            <>
              <MultiSelectDropdown label="Brands"    options={filterOptions.brands}       selected={selectedBrands}       onChange={onBrandsChange} />
              <MultiSelectDropdown label="Feeds"     options={filterOptions.feeds}        selected={selectedFeeds}        onChange={onFeedsChange} />
              <MultiSelectDropdown label="Writers"   options={filterOptions.writers}      selected={selectedWriters}      onChange={onWritersChange} />
              <MultiSelectDropdown label="Editors"   options={filterOptions.editors}      selected={selectedEditors}      onChange={onEditorsChange} />
              <MultiSelectDropdown label="Types"     options={filterOptions.contentTypes} selected={selectedContentTypes} onChange={onContentTypesChange} />
              <MultiSelectDropdown label="Statuses"  options={filterOptions.statuses}     selected={selectedStatuses}     onChange={onStatusesChange} />
              <MultiSelectDropdown label="Allotters" options={filterOptions.allotters}    selected={selectedAllotters}    onChange={onAllottersChange} />
            </>
          )}
        </div>

        {/* Right: pinned actions — never wraps */}
        <div className="flex flex-shrink-0 items-center gap-1.5 border-l border-gray-200/70 pl-2.5 dark:border-gray-700/70">
          <span className="hidden whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500 sm:block">
            {lastSyncLabel}
          </span>

          {props.showSync !== false && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
              Sync
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-0.5 rounded-md border border-red-200 bg-red-50/80 px-2.5 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Active filter tags (second row, only when filters are set) ── */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-gray-100/80 px-3 py-1.5 dark:border-gray-800/80">
          {activeTags.map((tag) => (
            <span
              key={tag.label}
              onClick={tag.onClear}
              className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400"
            >
              {tag.label}
              <X size={9} />
            </span>
          ))}
        </div>
      )}
      </div>{/* end glass card */}

      {/* ── Gradient fade-out strip ──
          Content scrolling up toward the filter dissolves through this
          gradient before disappearing behind the glass. */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-7 bg-gradient-to-b from-[#f8f9fa] to-transparent dark:from-gray-950"
      />
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
