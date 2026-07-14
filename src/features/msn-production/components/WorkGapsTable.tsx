"use client";

import { useMemo, useState } from "react";
import { CalendarOff, ChevronRight, Search } from "lucide-react";
import type { WorkGapsResult, WorkGapPerson } from "../types";
import { useTableSort, SortableTh } from "./SortableHeader";
import { TableCsvButton } from "@/components/ui/TableCsvButton";

interface Props {
  data?: WorkGapsResult;
  isLoading: boolean;
}

type Role = "writers" | "editors" | "allotters";

const ROLE_LABEL: Record<Role, string> = {
  writers: "Writers",
  editors: "Editors",
  allotters: "Allotters",
};

function fmtDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

const dash = (v: string) => (v && v !== "Unknown" ? v : "—");

export default function WorkGapsTable({ data, isLoading }: Props) {
  const [role, setRole] = useState<Role>("writers");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const rows: WorkGapPerson[] = useMemo(
    () => (data ? data[role] : []),
    [data, role],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  const { sorted, sortKey, sortDir, handleSort } = useTableSort(
    filtered,
    (r, key) => {
      switch (key) {
        case "name":
          return r.name;
        case "weekoff":
          return r.weekoff || null;
        case "periodWorkingDays":
          return r.periodWorkingDays;
        case "daysWorked":
          return r.daysWorked;
        case "daysNotWorked":
          return r.daysNotWorked;
        default:
          return null;
      }
    },
    { key: "daysNotWorked", dir: "desc" },
  );

  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const toggle = (name: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      const k = `${role}:${name}`;
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const tabs: { key: Role; label: string; count: number }[] = [
    { key: "writers", label: "Writers", count: data.writers.length },
    { key: "editors", label: "Editors", count: data.editors.length },
    { key: "allotters", label: "Allotters", count: data.allotters.length },
  ];

  const period = `${fmtDay(data.start)} – ${fmtDay(data.end)}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <CalendarOff size={14} className="text-indigo-500" />
            Days Not Worked
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Working days with no logged activity per person ({period}) · week-offs
            excluded · counted from each person&apos;s first active day
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setRole(t.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  role === t.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t.label}
                <span className="ml-1 opacity-70 tabular-nums">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search person…"
              className="w-40 rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-300 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
          <TableCsvButton filename="msn_work_gaps" />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-xs text-gray-400">
          No {ROLE_LABEL[role].toLowerCase()} with activity in this period
        </p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="w-6 px-2 py-2" />
                <SortableTh label={ROLE_LABEL[role].slice(0, -1)} colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Week-off" colKey="weekoff" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Working days" colKey="periodWorkingDays" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Worked" colKey="daysWorked" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Not worked" colKey="daysNotWorked" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {sorted.map((p) => {
                const expanded = open.has(`${role}:${p.name}`);
                const hasDates = p.notWorkedDates.length > 0;
                return (
                  <>
                    <tr
                      key={p.name}
                      onClick={() => hasDates && toggle(p.name)}
                      className={`${hasDates ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60" : ""}`}
                    >
                      <td className="px-2 py-2">
                        {hasDates && (
                          <ChevronRight
                            size={12}
                            className={`text-gray-300 transition-transform dark:text-gray-600 ${expanded ? "rotate-90" : ""}`}
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                        {p.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                        {dash(p.weekoff)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                        {p.periodWorkingDays}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                        {p.daysWorked}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span
                          className={`font-semibold ${
                            p.daysNotWorked > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {p.daysNotWorked}
                        </span>
                      </td>
                    </tr>
                    {expanded && hasDates && (
                      <tr key={`${p.name}-dates`} className="bg-gray-50/60 dark:bg-gray-800/40">
                        <td />
                        <td colSpan={5} className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {p.notWorkedDates.map((d) => (
                              <span
                                key={d}
                                className="rounded bg-white px-1.5 py-0.5 text-[10px] tabular-nums text-gray-500 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700"
                              >
                                {fmtDay(d)}
                              </span>
                            ))}
                            {p.daysNotWorked > p.notWorkedDates.length && (
                              <span className="px-1 py-0.5 text-[10px] text-gray-400">
                                +{p.daysNotWorked - p.notWorkedDates.length} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
