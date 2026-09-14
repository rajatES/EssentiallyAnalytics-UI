"use client";

import { useCallback, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { PendingItem } from "../types";
import { fmtHours, fmtAgo, ageTone, AGE_TONE_CLASS, STAGE_CLASS } from "../format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";

interface Props {
  items?: PendingItem[];
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const PAGE = 25;

export default function PendingTable({
  items,
  isLoading,
  title = "Queue Detail",
  subtitle = "Everything still in flight, oldest first",
}: Props) {
  const [limit, setLimit] = useState(PAGE);
  const rows = items ?? [];

  const getValue = useCallback(
    (r: PendingItem, key: string) => r[key as keyof PendingItem] as string | number,
    [],
  );
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(rows, getValue);

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const visible = sorted.slice(0, limit);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">{subtitle}</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] text-xs">
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortableTh label="Stage" colKey="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="With" colKey="pendingWith" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Division" colKey="division" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <SortableTh label="Waiting" colKey="ageingHours" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-3 py-2 text-right font-medium">Since</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-50 last:border-0 dark:border-gray-800/50"
              >
                <td className="px-3 py-2">
                  <span
                    className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      STAGE_CLASS[r.stage] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.stage}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                  {r.pendingWith}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  {r.division}
                </td>
                <td className="max-w-[380px] px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-gray-700 dark:text-gray-300" title={r.title}>
                      {r.title}
                    </span>
                    {r.stagingLink && (
                      <a
                        href={r.stagingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-300 hover:text-indigo-500 dark:text-gray-600"
                        title="Open staging link"
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`rounded px-1.5 py-0.5 tabular-nums ${AGE_TONE_CLASS[ageTone(r.ageingHours)]}`}
                  >
                    {fmtHours(r.ageingHours)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-gray-400 dark:text-gray-500">
                  {fmtAgo(r.waitingSince)}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                  Nothing waiting — the queue is clear
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {limit < sorted.length && (
        <button
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Show {Math.min(PAGE, sorted.length - limit)} more
        </button>
      )}
    </div>
  );
}
