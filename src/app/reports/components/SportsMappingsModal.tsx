"use client";

import React, { useState, useMemo } from "react";
import { X, Plus, Tag, Users, ChevronDown, RefreshCw, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ReportSportsMappingRow,
  updateReportSportsMapping,
  batchUpdateReportSportsMappingSport,
} from "@/lib/api";

/* ─── Sport Dropdown ─── */
function SportDropdown({
  currentSport,
  sports,
  isPending,
  onSelect,
}: {
  currentSport: string | null;
  sports: string[];
  isPending: boolean;
  onSelect: (sport: string | null) => void;
}) {
  const isAssigned = !!currentSport;
  return (
    <div className="relative">
      <select
        value={currentSport || ""}
        onChange={(e) => onSelect(e.target.value === "" ? null : e.target.value)}
        disabled={isPending}
        className={`w-full max-w-[220px] appearance-none rounded-lg border py-1.5 pl-3 pr-8 text-xs font-medium transition-colors cursor-pointer outline-none disabled:opacity-50
          ${
            isAssigned
              ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:border-indigo-700"
              : "border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500"
          }`}
      >
        <option value="">Unassigned</option>
        {sports.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

/* ─── Main Modal ─── */
export default function SportsMappingsModal({
  mappings,
  onClose,
  onMutate,
}: {
  mappings: ReportSportsMappingRow[];
  onClose: () => void;
  onMutate: () => void;
}) {
  const [newSportInput, setNewSportInput] = useState("");
  const [localSports, setLocalSports] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);

  // --- Data Re-Sync state ---
  const [showResync, setShowResync] = useState(false);
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 7);
  const [resyncStart, setResyncStart] = useState(getLocalDateString(defaultStart));
  const [resyncEnd, setResyncEnd] = useState(getLocalDateString(defaultEnd));
  const [resyncLoading, setResyncLoading] = useState(false);
  const [resyncResult, setResyncResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const allSports = useMemo(() => {
    const fromMappings = mappings
      .map((m) => m.sport)
      .filter((s): s is string => !!s);
    const merged = new Set([...fromMappings, ...localSports]);
    return Array.from(merged).sort();
  }, [mappings, localSports]);

  const addSport = () => {
    const name = newSportInput.trim();
    if (!name || allSports.includes(name)) return;
    setLocalSports((prev) => [...prev, name]);
    setNewSportInput("");
  };

  const removeSport = async (sportName: string) => {
    const pagesInSport = mappings.filter((m) => m.sport === sportName);
    if (pagesInSport.length > 0) {
      if (
        !confirm(
          `"${sportName}" has ${pagesInSport.length} page(s). Unassign all and remove this sport?`,
        )
      )
        return;
      try {
        setIsPending(true);
        const ids = pagesInSport.map((p) => p.id);
        await batchUpdateReportSportsMappingSport(ids, null);
        onMutate();
      } catch (err) {
        console.error("Failed to unassign pages from sport", err);
        alert("Failed to remove sport. Please try again.");
        return;
      } finally {
        setIsPending(false);
      }
    }
    setLocalSports((prev) => prev.filter((s) => s !== sportName));
  };

  const assignSport = async (mappingId: number, sport: string | null) => {
    try {
      setIsPending(true);
      await updateReportSportsMapping(mappingId, sport);
      onMutate();
    } catch (err) {
      console.error("Failed to assign sport", err);
    } finally {
      setIsPending(false);
    }
  };

  // --- Data Re-Sync handler ---
  const handleResync = async () => {
    if (!resyncStart || !resyncEnd) return;

    const profileIds = mappings.map((m) => m.profileId);
    if (profileIds.length === 0) {
      setResyncResult({ type: "error", message: "No pages available to re-sync." });
      return;
    }

    setResyncLoading(true);
    setResyncResult(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${BACKEND_URL}/api/analytics/resync-range`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profileIds,
          startDate: resyncStart,
          endDate: resyncEnd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResyncResult({ type: "error", message: data.error || "Re-sync failed." });
      } else {
        setResyncResult({
          type: "success",
          message: data.message || `Re-sync queued for ${data.queued} page(s).`,
        });
      }
    } catch (err: any) {
      setResyncResult({
        type: "error",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      setResyncLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Sports Mappings
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage sports categories and assign pages
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ═══ Manage Sports ═══ */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={15} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Manage Sports
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Add or remove sport labels
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    value={newSportInput}
                    onChange={(e) => setNewSportInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSport();
                      }
                    }}
                    placeholder="New sport name..."
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={addSport}
                  disabled={
                    !newSportInput.trim() ||
                    allSports.includes(newSportInput.trim())
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {allSports.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">
                  No sports yet. Add a sport above or assign one to a page
                  below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allSports.map((sport) => {
                    const count = mappings.filter(
                      (m) => m.sport === sport,
                    ).length;
                    return (
                      <div
                        key={sport}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 pl-3 pr-1.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
                      >
                        <span>{sport}</span>
                        <span className="text-[10px] text-indigo-400 dark:text-indigo-500">
                          ({count})
                        </span>
                        <button
                          onClick={() => removeSport(sport)}
                          className="ml-0.5 rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-700 dark:hover:bg-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          title={`Remove "${sport}"`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ═══ Page Assignments ═══ */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Users size={15} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Page Assignments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Page Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                      Sport
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        No pages found. Mappings will populate once profiles are
                        synced.
                      </td>
                    </tr>
                  ) : (
                    mappings.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                          {row.pageName}
                        </td>
                        <td className="px-4 py-2.5">
                          <SportDropdown
                            currentSport={row.sport}
                            sports={allSports}
                            isPending={isPending}
                            onSelect={(sport) => assignSport(row.id, sport)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ Data Re-Sync (Advanced) ═══ */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-900/10 overflow-hidden">
            <button
              onClick={() => setShowResync(!showResync)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Data Re-Sync
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">
                  Advanced
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-amber-500 dark:text-amber-400 transition-transform duration-200 ${showResync ? "rotate-180" : ""}`}
              />
            </button>

            {showResync && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-amber-200/50 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
                  Re-fetch data from Meta for a specific date range across <strong>all {mappings.length} connected page(s)</strong>.
                  This will overwrite existing data for the selected dates with fresh values from Meta&apos;s API.
                  Use this to fix incorrect or missing data for a specific time period.
                </p>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/60 pointer-events-none"
                      />
                      <input
                        type="date"
                        value={resyncStart}
                        onChange={(e) => setResyncStart(e.target.value)}
                        className="w-full rounded-lg border border-amber-300 bg-white pl-8 pr-3 py-2 text-sm font-medium text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-amber-700 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/60 pointer-events-none"
                      />
                      <input
                        type="date"
                        value={resyncEnd}
                        onChange={(e) => setResyncEnd(e.target.value)}
                        className="w-full rounded-lg border border-amber-300 bg-white pl-8 pr-3 py-2 text-sm font-medium text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-amber-700 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResync}
                    disabled={resyncLoading || !resyncStart || !resyncEnd}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {resyncLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Re-Sync
                      </>
                    )}
                  </button>
                </div>

                {resyncResult && (
                  <div
                    className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${
                      resyncResult.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                    }`}
                  >
                    {resyncResult.type === "success" ? (
                      <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    )}
                    <span>{resyncResult.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
