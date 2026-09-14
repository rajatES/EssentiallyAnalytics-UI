"use client";

import { useCallback } from "react";
import type { SendBackResult } from "../types";
import { fmtInt, fmtPct, rateTone, AGE_TONE_CLASS } from "../format";
import { useTableSort, SortableTh } from "@/components/ui/SortableTable";

interface Props {
  data?: SendBackResult;
  isLoading: boolean;
}

type Row = { name: string; sentBack: number; base: number; rate: number };

/**
 * Editors and writers side by side. A high editor rate means that editor
 * returns more of what they see; a high writer rate means more of what they
 * submit comes back. Only people with enough volume to read anything into are
 * worth ranking, so singles are kept but visually de-emphasised.
 */
function PersonTable({
  title,
  subtitle,
  baseLabel,
  rows,
}: {
  title: string;
  subtitle: string;
  baseLabel: string;
  rows: Row[];
}) {
  const getValue = useCallback(
    (r: Row, key: string) => r[key as keyof Row] as string | number,
    [],
  );
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(rows, getValue);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">{subtitle}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-xs">
          <thead className="text-gray-400 dark:text-gray-500">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortableTh label="Name" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label={baseLabel} colKey="base" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Sent Back" colKey="sentBack" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableTh label="Rate" colKey="rate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 15).map((r) => (
              <tr key={r.name} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{r.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                  {fmtInt(r.base)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {fmtInt(r.sentBack)}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`rounded px-1.5 py-0.5 tabular-nums ${
                      r.base < 5 ? "text-gray-400" : AGE_TONE_CLASS[rateTone(r.rate)]
                    }`}
                    title={r.base < 5 ? "Too few pieces to read much into" : undefined}
                  >
                    {fmtPct(r.rate)}
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                  No send-backs in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SendBackByPerson({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
          />
        ))}
      </div>
    );
  }

  const editors: Row[] = data.byEditor
    .filter((e) => e.sentBack > 0)
    .map((e) => ({ name: e.editor, sentBack: e.sentBack, base: e.handled, rate: e.rate }));
  const writers: Row[] = data.byWriter
    .filter((w) => w.sentBack > 0)
    .map((w) => ({ name: w.writer, sentBack: w.sentBack, base: w.submitted, rate: w.rate }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PersonTable
        title="Editors Returning Work"
        subtitle="Share of what each editor reviewed that they sent back"
        baseLabel="Reviewed"
        rows={editors}
      />
      <PersonTable
        title="Writers Getting Work Back"
        subtitle="Share of each writer's submissions that were returned"
        baseLabel="Submitted"
        rows={writers}
      />
    </div>
  );
}
