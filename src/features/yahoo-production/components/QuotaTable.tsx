"use client";

import { useCallback } from "react";
import type { YpQuotaAttainment } from "../types";
import { csvNum, fmtDec, fmtInt } from "@/features/critical-flow/format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";
import ExportCsvButton from "@/components/ui/ExportCsvButton";
import type { CsvColumn } from "@/lib/csv";

const CSV_COLUMNS: CsvColumn<YpQuotaAttainment>[] = [
  { header: "Division", value: (r) => r.quotaGroup },
  { header: "Covers", value: (r) => r.divisions.join(" + ") },
  { header: "Window", value: (r) => r.window },
  { header: "PoC", value: (r) => r.poc },
  { header: "Quota / Day", value: (r) => r.quota },
  { header: "Allotted", value: (r) => r.allotted },
  { header: "Published", value: (r) => r.published },
  { header: "Per Active Day", value: (r) => csvNum(r.perDay, 2) },
  { header: "Active Days", value: (r) => r.activeDays },
  { header: "Attainment (%)", value: (r) => csvNum(r.attainment, 0) },
];

interface Props {
  data?: YpQuotaAttainment[];
  isLoading: boolean;
}

/** Green at target, amber within reach, red well short. Grey with no target. */
function toneFor(attainment: number | null): string {
  if (attainment == null) return "text-gray-400";
  if (attainment >= 95) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
  if (attainment >= 75) return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
}

/**
 * Output against the daily quota the managers record per division.
 *
 * Measured per *active* day — a day the group published something — rather
 * than per calendar day, so a quiet weekend does not read as a missed target.
 */
export default function QuotaTable({ data, isLoading }: Props) {
  const rows = data ?? [];
  const getValue = useCallback(
    (r: YpQuotaAttainment, key: string) =>
      r[key as keyof YpQuotaAttainment] as string | number | null,
    [],
  );
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(rows, getValue, {
    key: "published",
  });

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Quota Attainment
          </h2>
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
            Published per active day against the recorded daily quota. Check the
            shift window before reading a figure above 100% — a division running
            both EMP and LNP may be holding the quota per shift rather than per day.
          </p>
        </div>
        <ExportCsvButton rows={sorted} columns={CSV_COLUMNS} filename="yahoo-quota-attainment" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-xs">
          <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <SortableTh label="Division" colKey="quotaGroup" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Window" colKey="window" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="PoC" colKey="poc" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Quota / Day" colKey="quota" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Allotted" colKey="allotted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Published" colKey="published" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Per Day" colKey="perDay" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Attainment" colKey="attainment" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.quotaGroup}
                className="border-b border-gray-50 last:border-0 dark:border-gray-800/50"
              >
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                  {r.quotaGroup}
                  {r.divisions.length > 1 && (
                    <span className="block text-[10px] font-normal text-gray-400">
                      {r.divisions.join(" + ")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  {r.window || "—"}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  {r.poc || "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {r.quota == null ? (
                    <span className="text-gray-400" title="No quota recorded for this division">
                      not set
                    </span>
                  ) : (
                    fmtInt(r.quota)
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {fmtInt(r.allotted)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {fmtInt(r.published)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {fmtDec(r.perDay, 2)}
                  <span className="block text-[10px] text-gray-400">
                    over {r.activeDays}d
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`rounded px-1.5 py-0.5 tabular-nums ${toneFor(r.attainment)}`}
                  >
                    {r.attainment == null ? "—" : `${fmtDec(r.attainment, 0)}%`}
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                  No quota data for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
