"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortDir = "asc" | "desc";

type SortValue = string | number | null | undefined;

/**
 * Column-header sorting for the MSN Production tables.
 *
 * `getValue` maps a row + column key to a scalar to compare. Rows keep their
 * incoming order until the user clicks a header (sortKey starts null), so the
 * backend's default ordering is preserved on first render.
 */
export function useTableSort<T>(
  rows: T[],
  getValue: (row: T, key: string) => SortValue,
  initial?: { key: string; dir?: SortDir },
) {
  const [sortKey, setSortKey] = useState<string | null>(initial?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initial?.dir ?? "desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      const aEmpty = av === null || av === undefined;
      const bEmpty = bv === null || bv === undefined;
      // Missing values always sort to the bottom, regardless of direction.
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      if (typeof av === "string" || typeof bv === "string") {
        return (
          String(av).localeCompare(String(bv), undefined, { numeric: true }) *
          dir
        );
      }
      return ((av as number) - (bv as number)) * dir;
    });
  }, [rows, sortKey, sortDir, getValue]);

  return { sorted, sortKey, sortDir, handleSort };
}

/**
 * A clickable `<th>` matching the reports "Page-wise Breakdown" look — the
 * label with an arrow that reflects the active sort direction.
 */
export function SortableTh({
  label,
  colKey,
  align = "left",
  sortKey,
  sortDir,
  onSort,
  className = "",
}: {
  label: React.ReactNode;
  colKey: string;
  align?: "left" | "right";
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = sortKey === colKey;
  return (
    <th
      onClick={() => onSort(colKey)}
      className={`cursor-pointer select-none px-3 py-2 font-medium transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp size={11} className="text-indigo-500" />
          ) : (
            <ArrowDown size={11} className="text-indigo-500" />
          )
        ) : (
          <ArrowUpDown size={11} className="opacity-40" />
        )}
      </span>
    </th>
  );
}
