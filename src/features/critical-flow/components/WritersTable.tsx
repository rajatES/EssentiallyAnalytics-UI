"use client";

import { useCallback } from "react";
import type { WriterStats } from "../types";
import { csvHours, csvNum, fmtDec, fmtHours, fmtInt, fmtPct, rateTone, AGE_TONE_CLASS } from "../format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";
import ExportCsvButton from "@/components/ui/ExportCsvButton";
import type { CsvColumn } from "@/lib/csv";

interface Props {
  data?: WriterStats[];
  isLoading: boolean;
  /**
   * Whether this pipeline has a send-back loop. Yahoo runs one editorial pass
   * and never sends work back, so those columns would read zero on every row.
   */
  showSendBacks?: boolean;
  csvPrefix?: string;
}

const CSV_COLUMNS: (CsvColumn<WriterStats> & { sendBack?: boolean })[] = [
  { header: "Writer", value: (r) => r.writer },
  { header: "Division", value: (r) => r.division },
  { header: "Allotted", value: (r) => r.allotted },
  { header: "Submitted", value: (r) => r.submitted },
  { header: "Published", value: (r) => r.published },
  { header: "Sent Back", value: (r) => r.sentBack, sendBack: true },
  { header: "Send-Back Rate (%)", value: (r) => csvNum(r.sendBackRate), sendBack: true },
  { header: "Median TAT (h)", value: (r) => csvHours(r.medianTatHours) },
  { header: "Avg TAT (h)", value: (r) => csvHours(r.avgTatHours) },
  { header: "Per Active Day", value: (r) => csvNum(r.perActiveDay, 2) },
  { header: "Active Days", value: (r) => r.activeDays },
  { header: "In Queue", value: (r) => r.pending },
];

export default function WritersTable({
  data,
  isLoading,
  showSendBacks = true,
  csvPrefix = "critical-flow",
}: Props) {
  const rows = data ?? [];
  const getValue = useCallback(
    (r: WriterStats, key: string) => r[key as keyof WriterStats] as string | number,
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
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Writers</h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Per Day counts only days they actually submitted, so time off does not drag the rate down.
            Names are resolved within a division, so &quot;Khosalu&quot; and &quot;Khosalu Puro&quot; count as one person.
          </p>
        </div>
        <ExportCsvButton
          rows={sorted}
          columns={showSendBacks ? CSV_COLUMNS : CSV_COLUMNS.filter((c) => !c.sendBack)}
          filename={`${csvPrefix}-writers`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${showSendBacks ? "min-w-[1040px]" : "min-w-[900px]"} text-xs`}>
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortableTh label="Writer" colKey="writer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Division" colKey="division" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Allotted" colKey="allotted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Submitted" colKey="submitted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Published" colKey="published" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              {showSendBacks && (
                <>
                  <SortableTh label="Sent Back" colKey="sentBack" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableTh label="SB Rate" colKey="sendBackRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </>
              )}
              <SortableTh label="Med TAT" colKey="medianTatHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Avg TAT" colKey="avgTatHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Per Day" colKey="perActiveDay" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="In Queue" colKey="pending" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={`${r.division}-${r.writer}`} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{r.writer}</td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.division}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.allotted)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.submitted)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.published)}</td>
                {showSendBacks && (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.sentBack)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`rounded px-1.5 py-0.5 tabular-nums ${
                          r.submitted < 5 ? "text-gray-400" : AGE_TONE_CLASS[rateTone(r.sendBackRate)]
                        }`}
                      >
                        {fmtPct(r.sendBackRate)}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtHours(r.medianTatHours)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtHours(r.avgTatHours)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {fmtDec(r.perActiveDay, 2)}
                  <span className="block text-[10px] text-gray-400">over {r.activeDays}d</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmtInt(r.pending)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={showSendBacks ? 11 : 9} className="px-3 py-8 text-center text-gray-400">
                  No writer activity in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
