"use client";

import type { ProductionResult } from "../types";
import { fmtHours, fmtPct } from "../format";
import { useTableSort, SortableTh } from "./SortableHeader";
import { TableCsvButton } from "@/components/ui/TableCsvButton";

interface Props {
  data?: ProductionResult;
  isLoading: boolean;
}

export default function DraftDeltaTable({ data, isLoading }: Props) {
  const { sorted: rows, sortKey, sortDir, handleSort } = useTableSort(
    data?.writers ?? [],
    (w, key) => {
      switch (key) {
        case "writer":
          return w.writer;
        case "allotted":
          return w.allotted.pieces;
        case "picked":
          return w.picked.pieces;
        case "drafted":
          return w.drafted.pieces;
        case "notPicked":
          return w.notPickedPieces;
        case "pickedNotDrafted":
          return w.pickedNotDraftedPieces;
        case "draftRate":
          return w.draftRate;
        case "articles":
          return w.drafted.articles;
        case "slideshows":
          return w.drafted.slideshows;
        case "slides":
          return w.drafted.slides;
        case "writeTime":
          return w.medianWriteHours;
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
            Writers — allotted vs drafted
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            By allotment date · shortfall split into not&nbsp;picked (never started)
            and picked&nbsp;·&nbsp;not&nbsp;drafted (started, not yet submitted)
          </p>
        </div>
        <TableCsvButton filename="msn_draft_delta" />
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No data</p>
      ) : (
        <div className="max-h-[520px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <SortableTh label="Writer" colKey="writer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Allotted" colKey="allotted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Picked" colKey="picked" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Drafted" colKey="drafted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Not picked" colKey="notPicked" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Picked·not drafted" colKey="pickedNotDrafted" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Drafted %" colKey="draftRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Articles" colKey="articles" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="SS" colKey="slideshows" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Slides" colKey="slides" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Write time" colKey="writeTime" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {rows.map((w) => (
                <tr key={w.writer}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {w.writer}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.allotted.pieces}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.picked.pieces}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-700 dark:text-gray-300">
                    {w.drafted.pieces}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      w.notPickedPieces > 0
                        ? "font-medium text-rose-600 dark:text-rose-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    title="Allotted but never picked up"
                  >
                    {w.notPickedPieces > 0 ? `−${w.notPickedPieces}` : "✓"}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      w.pickedNotDraftedPieces > 0
                        ? "font-medium text-amber-600 dark:text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    title="Picked up but not yet submitted"
                  >
                    {w.pickedNotDraftedPieces > 0
                      ? `−${w.pickedNotDraftedPieces}`
                      : "✓"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtPct(w.draftRate)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.drafted.articles}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.drafted.slideshows}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {w.drafted.slides.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {fmtHours(w.medianWriteHours)}
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
