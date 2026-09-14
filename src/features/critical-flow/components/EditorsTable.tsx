"use client";

import { useCallback } from "react";
import type { EditorStats } from "../types";
import { fmtHours, fmtInt, fmtPct, rateTone, AGE_TONE_CLASS } from "../format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";

interface Props {
  data?: EditorStats[];
  isLoading: boolean;
}

export default function EditorsTable({ data, isLoading }: Props) {
  const rows = data ?? [];
  const getValue = useCallback(
    (r: EditorStats, key: string) => r[key as keyof EditorStats] as string | number | null,
    [],
  );
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(rows, getValue);

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Editors</h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Review latency is submission → first editorial pass; second pass counts post-send-back rechecks
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-xs">
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortableTh label="Editor" colKey="editor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Division" colKey="division" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Reviewed" colKey="handled" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Verified" colKey="verified" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Sent Back" colKey="sentBack" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="SB Rate" colKey="sendBackRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="2nd Pass" colKey="secondPass" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Med Review" colKey="medianReviewHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Yahoo" colKey="yahoo" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={`${r.division}-${r.editor}`} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{r.editor}</td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.division}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.handled)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.verified)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.sentBack)}</td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`rounded px-1.5 py-0.5 tabular-nums ${
                      r.handled < 5 ? "text-gray-400" : AGE_TONE_CLASS[rateTone(r.sendBackRate)]
                    }`}
                  >
                    {fmtPct(r.sendBackRate)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">{fmtInt(r.secondPass)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {r.medianReviewHours == null ? "—" : fmtHours(r.medianReviewHours)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                  {r.yahoo}/{r.yahoo + r.nonYahoo}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                  No editorial activity in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
