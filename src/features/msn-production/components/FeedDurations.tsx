"use client";

import type { StageDurationResult } from "../types";
import { fmtHours } from "../format";
import { useTableSort, SortableTh } from "./SortableHeader";
import { TableCsvButton } from "@/components/ui/TableCsvButton";

interface Props {
  data?: StageDurationResult;
  isLoading: boolean;
}

export default function FeedDurations({ data, isLoading }: Props) {
  const { sorted: feeds, sortKey, sortDir, handleSort } = useTableSort(
    (data?.byFeed ?? []).slice(0, 12),
    (f, key) => {
      switch (key) {
        case "name":
          return f.name;
        case "count":
          return f.count;
        case "pick":
          return f.pickLatencyHours;
        case "write":
          return f.writingHours;
        case "review":
          return f.editingHours;
        case "publish":
          return f.publishHours;
        case "total":
          return f.totalHours;
        default:
          return null;
      }
    },
  );

  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Cycle Time by Feed
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Median stage durations for the busiest feeds
          </p>
        </div>
        <TableCsvButton filename="msn_feed_durations" />
      </div>

      {feeds.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800/60 dark:text-gray-500">
              <tr>
                <SortableTh label="Feed" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Pieces" colKey="count" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Pick" colKey="pick" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Write" colKey="write" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Review" colKey="review" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Publish" colKey="publish" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Total" colKey="total" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {feeds.map((f) => (
                <tr key={f.name}>
                  <td className="max-w-[200px] truncate px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {f.name}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {f.count}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.pickLatencyHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.writingHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.editingHours)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(f.publishHours)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                    {fmtHours(f.totalHours)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
