"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Download, Sliders, ChevronDown } from "lucide-react";
import {
  useReportPeriods,
  useReportEod,
  useReportEow,
  useReportMtd,
  useReportsConfig,
} from "../../hooks/useMsnData";
import { useRole } from "@/hooks/useRole";
import type { ReportsConfig } from "../../types";
import EodReport from "./EodReport";
import EowReport from "./EowReport";
import MtdReport from "./MtdReport";
import ReportFilters, { type FeedOption } from "./ReportFilters";
import TargetsModal from "./TargetsModal";
import {
  exportEod,
  exportFeedsDaily,
  exportEow,
  exportMtd,
} from "./export";

type ReportTab = "eod" | "eow" | "mtd";

const SUB_TABS: { key: ReportTab; label: string; hint: string }[] = [
  { key: "eod", label: "EOD", hint: "Daily" },
  { key: "eow", label: "EOW", hint: "Weekly" },
  { key: "mtd", label: "MTD", hint: "Month to date" },
];

function monthLabel(isoMonth: string): string {
  const [y, m] = isoMonth.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildFeedOptions(
  publications: string[],
  config: ReportsConfig | undefined,
): FeedOption[] {
  const order = Object.keys(config?.publications ?? {});
  const seen = new Set(publications);
  const opts: FeedOption[] = [];
  const push = (name: string) => {
    const cfg = config?.publications?.[name];
    opts.push({
      name,
      shortName: cfg?.shortName ?? name,
      tier: cfg?.tier ?? "—",
    });
  };
  for (const name of order) if (seen.has(name)) push(name);
  for (const name of publications) if (!order.includes(name)) push(name);
  return opts;
}

export default function ReportsView() {
  const { canAccess } = useRole();
  const [subTab, setSubTab] = useState<ReportTab>("eod");
  const [eodDate, setEodDate] = useState<string | undefined>(undefined);
  const [eowStart, setEowStart] = useState<string | undefined>(undefined);
  const [mtdMonth, setMtdMonth] = useState<string | undefined>(undefined);

  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [targetsOpen, setTargetsOpen] = useState(false);

  const periods = useReportPeriods();
  const config = useReportsConfig();

  const eod = useReportEod(subTab === "eod" ? eodDate : undefined);
  const eow = useReportEow(subTab === "eow" ? eowStart : undefined);
  const mtd = useReportMtd(subTab === "mtd" ? mtdMonth : undefined);

  const activePublications = useMemo(() => {
    const rows =
      subTab === "eod"
        ? eod.data?.rows
        : subTab === "eow"
          ? eow.data?.rows
          : mtd.data?.rows;
    return (rows ?? []).map((r) => r.publication);
  }, [subTab, eod.data, eow.data, mtd.data]);

  const feedOptions = useMemo(
    () => buildFeedOptions(activePublications, config.data),
    [activePublications, config.data],
  );

  const availableTiers = useMemo(() => {
    const tiers = new Set(feedOptions.map((f) => f.tier).filter((t) => t !== "—"));
    return ["T1", "T2", "T3"].filter((t) => tiers.has(t));
  }, [feedOptions]);

  const matchRow = useMemo(() => {
    const feedSet = new Set(selectedFeeds);
    const tierSet = new Set(selectedTiers);
    return (publication: string) => {
      if (feedSet.size && !feedSet.has(publication)) return false;
      if (tierSet.size) {
        const tier = config.data?.publications?.[publication]?.tier;
        if (!tier || !tierSet.has(tier)) return false;
      }
      return true;
    };
  }, [selectedFeeds, selectedTiers, config.data]);

  function filterResult<T extends { rows: Array<{ publication: string }> }>(
    result: T | undefined,
  ): T | undefined {
    if (!result) return result;
    return { ...result, rows: result.rows.filter((r) => matchRow(r.publication)) };
  }

  const eodData = filterResult(eod.data);
  const eowData = filterResult(eow.data);
  const mtdData = filterResult(mtd.data);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  // Export options for the active sub-tab.
  const exportOptions = useMemo(() => {
    if (subTab === "eod" && eodData?.rows.length) {
      return [
        { label: "EOD table (MSN EOD)", run: () => exportEod(eodData, config.data) },
        { label: "Feeds daily (MSN Feeds Daily)", run: () => exportFeedsDaily(eodData) },
      ];
    }
    if (subTab === "eow" && eowData?.rows.length) {
      return [{ label: "EOW table (MSN EOW)", run: () => exportEow(eowData, config.data) }];
    }
    if (subTab === "mtd" && mtdData?.rows.length) {
      return [{ label: "MTD table (MSN MTD)", run: () => exportMtd(mtdData, config.data) }];
    }
    return [];
  }, [subTab, eodData, eowData, mtdData, config.data]);

  const selectClass =
    "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-500";

  return (
    <div className="space-y-4">
      {/* Toolbar: sub-tabs · period · export · targets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {SUB_TABS.map(({ key, label, hint }) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              title={hint}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                subTab === key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-gray-400" />
          {subTab === "eod" && (
            <select
              value={eodDate ?? periods.data?.eod?.[0] ?? ""}
              onChange={(e) => setEodDate(e.target.value || undefined)}
              className={selectClass}
            >
              {(periods.data?.eod ?? []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              {!periods.data?.eod?.length && <option value="">No reports yet</option>}
            </select>
          )}
          {subTab === "eow" && (
            <select
              value={eowStart ?? periods.data?.eow?.[0]?.weekStart ?? ""}
              onChange={(e) => setEowStart(e.target.value || undefined)}
              className={selectClass}
            >
              {(periods.data?.eow ?? []).map((w) => (
                <option key={w.weekStart} value={w.weekStart}>
                  {w.weekStart} → {w.weekEnd}
                </option>
              ))}
              {!periods.data?.eow?.length && <option value="">No reports yet</option>}
            </select>
          )}
          {subTab === "mtd" && (
            <select
              value={mtdMonth ?? periods.data?.mtd?.[0]?.month ?? ""}
              onChange={(e) => setMtdMonth(e.target.value || undefined)}
              className={selectClass}
            >
              {(periods.data?.mtd ?? []).map((m) => (
                <option key={m.month} value={m.month}>
                  {monthLabel(m.month)}
                  {m.asOf ? ` (as of ${m.asOf})` : ""}
                </option>
              ))}
              {!periods.data?.mtd?.length && <option value="">No reports yet</option>}
            </select>
          )}

          <ExportMenu options={exportOptions} />

          {canAccess("admin") && (
            <button
              onClick={() => setTargetsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Sliders size={13} />
              Targets
            </button>
          )}
        </div>
      </div>

      {feedOptions.length > 0 && (
        <ReportFilters
          feeds={feedOptions}
          tiers={availableTiers}
          selectedFeeds={selectedFeeds}
          selectedTiers={selectedTiers}
          onToggleFeed={(name) => setSelectedFeeds((p) => toggle(p, name))}
          onToggleTier={(t) => setSelectedTiers((p) => toggle(p, t))}
          onClear={() => {
            setSelectedFeeds([]);
            setSelectedTiers([]);
          }}
        />
      )}

      {subTab === "eod" && (
        <EodReport
          data={eodData}
          isLoading={eod.isLoading}
          isError={eod.isError}
          config={config.data}
        />
      )}
      {subTab === "eow" && (
        <EowReport
          data={eowData}
          isLoading={eow.isLoading}
          isError={eow.isError}
          config={config.data}
        />
      )}
      {subTab === "mtd" && (
        <MtdReport
          data={mtdData}
          isLoading={mtd.isLoading}
          isError={mtd.isError}
          config={config.data}
        />
      )}

      <TargetsModal open={targetsOpen} onClose={() => setTargetsOpen(false)} />
    </div>
  );
}

function ExportMenu({
  options,
}: {
  options: { label: string; run: () => void }[];
}) {
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

  const disabled = options.length === 0;

  // Single option → plain button; multiple → dropdown.
  if (options.length === 1) {
    return (
      <button
        onClick={options[0].run}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Download size={13} />
        Export
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Download size={13} />
        Export
        <ChevronDown size={12} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                o.run();
                setOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
