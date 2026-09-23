"use client";

import { useCallback } from "react";
import type { DivisionStats } from "../types";
import { fmtHours, fmtInt, fmtPct, rateTone, AGE_TONE_CLASS } from "../format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";

interface Props {
  data?: DivisionStats[];
  isLoading: boolean;
  /**
   * Whether this pipeline has a send-back loop. Yahoo runs one editorial pass
   * and never sends work back, so those columns would read zero on every row.
   */
  showSendBacks?: boolean;
}

export default function DivisionTable({
  data,
  isLoading,
  showSendBacks = true,
}: Props) {
  const rows = data ?? [];
  const getValue = useCallback(
    (r: DivisionStats, key: string) => r[key as keyof DivisionStats] as string | number,
    [],
  );
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(rows, getValue);

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        By Division
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Volume, throughput and quality for each source workbook
      </p>

      <div className="overflow-x-auto">
        <table className={`w-full ${showSendBacks ? "min-w-[860px]" : "min-w-[790px]"} text-xs`}>
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortableTh label="Division" colKey="division" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Allotted" colKey="allotted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Published" colKey="published" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Rate" colKey="publishRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              {showSendBacks && (
                <SortableTh label="Sent Back" colKey="sentBack" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              )}
              <SortableTh label="In Queue" colKey="pending" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Med TAT" colKey="medianTatHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Avg TAT" colKey="avgTatHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="People" colKey="writers" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const sbRate = r.allotted > 0 ? (r.sentBack / r.allotted) * 100 : 0;
              return (
                <tr
                  key={r.division}
                  className="border-b border-gray-50 last:border-0 dark:border-gray-800/50"
                >
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                    {r.division}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtInt(r.allotted)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtInt(r.published)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtPct(r.publishRate)}
                  </td>
                  {showSendBacks && (
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`rounded px-1.5 py-0.5 tabular-nums ${AGE_TONE_CLASS[rateTone(sbRate)]}`}
                      >
                        {fmtInt(r.sentBack)}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtInt(r.pending)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtHours(r.medianTatHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {fmtHours(r.avgTatHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {r.writers}w / {r.editors}e
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={showSendBacks ? 9 : 8} className="px-3 py-8 text-center text-gray-400">
                  No pieces in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
