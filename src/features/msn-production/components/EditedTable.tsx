"use client";

import type { ProductionResult } from "../types";
import { fmtHours } from "../format";
import { useTableSort, SortableTh } from "./SortableHeader";
import { TableCsvButton } from "@/components/ui/TableCsvButton";

interface Props {
  data?: ProductionResult;
  isLoading: boolean;
}

export default function EditedTable({ data, isLoading }: Props) {
  const { sorted: rows, sortKey, sortDir, handleSort } = useTableSort(
    data?.editors ?? [],
    (e, key) => {
      switch (key) {
        case "editor":
          return e.editor;
        case "pieces":
          return e.pieces;
        case "articles":
          return e.articles;
        case "slideshows":
          return e.slideshows;
        case "slides":
          return e.slides;
        case "pending":
          return e.pending;
        case "editTime":
          return e.medianEditHours;
        default:
          return null;
      }
    },
  );

  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Editing
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Pieces that cleared review per editor · by review date
          </p>
        </div>
        <TableCsvButton filename="msn_edited" />
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="max-h-[460px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <SortableTh label="Editor" colKey="editor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Edited" colKey="pieces" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Articles" colKey="articles" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="SS" colKey="slideshows" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Slides" colKey="slides" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Pending" colKey="pending" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Edit time" colKey="editTime" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {rows.map((e) => (
                <tr key={e.editor}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {e.editor}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-700 dark:text-gray-300">
                    {e.pieces}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {e.articles}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {e.slideshows}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {e.slides.toLocaleString()}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      e.pending > 0
                        ? "font-medium text-amber-600 dark:text-amber-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {e.pending > 0 ? e.pending : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(e.medianEditHours)}
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
