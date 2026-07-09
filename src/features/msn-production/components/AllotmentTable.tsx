"use client";

import type { ProductionResult } from "../types";
import { useTableSort, SortableTh } from "./SortableHeader";

interface Props {
  data?: ProductionResult;
  isLoading: boolean;
}

export default function AllotmentTable({ data, isLoading }: Props) {
  const { sorted: rows, sortKey, sortDir, handleSort } = useTableSort(
    data?.allotters ?? [],
    (a, key) => {
      switch (key) {
        case "name":
          return a.name;
        case "pieces":
          return a.pieces;
        case "articles":
          return a.articles;
        case "slideshows":
          return a.slideshows;
        case "slides":
          return a.slides;
        case "perDay":
          return a.perDay;
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
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Allotment
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Pieces handed out per allotter (SGH) in the selected period
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="max-h-[460px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <SortableTh label="SGH" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Pieces" colKey="pieces" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Articles" colKey="articles" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="SS" colKey="slideshows" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Slides" colKey="slides" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Per day" colKey="perDay" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {rows.map((a) => (
                <tr key={a.name}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {a.name}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-700 dark:text-gray-300">
                    {a.pieces}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {a.articles}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {a.slideshows}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {a.slides.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {a.perDay}
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
