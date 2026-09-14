"use client";

import { AlertTriangle, UserX, Users } from "lucide-react";
import type { RosterResult } from "../types";
import { fmtInt } from "../format";

interface Props {
  data?: RosterResult;
  isLoading: boolean;
}

const ROLE_CLASS: Record<string, string> = {
  writer: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  editor: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  lead: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function RosterBoard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const byDivision = new Map<string, typeof data.people>();
  for (const p of data.people) {
    if (!byDivision.has(p.division)) byDivision.set(p.division, []);
    byDivision.get(p.division)!.push(p);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Roster</h2>
        <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">
          From each division&apos;s Division Info tab, with live workload
        </p>

        <div className="space-y-5">
          {[...byDivision.entries()].map(([division, people]) => {
            const summary = data.byDivision.find((d) => d.division === division);
            return (
              <div key={division}>
                <div className="mb-2 flex items-baseline gap-3">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                    {division}
                  </h3>
                  {summary && (
                    <span className="text-[11px] text-gray-400">
                      {summary.writers} writers · {summary.editors} editors ·{" "}
                      {summary.offToday} off today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {people.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-2.5 ${
                        p.offToday
                          ? "border-dashed border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-800/30"
                          : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
                            {p.name}
                          </p>
                          <p className="truncate text-[10px] text-gray-400" title={p.role}>
                            {p.role || "—"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            ROLE_CLASS[p.roleGroup] ?? ROLE_CLASS.other
                          }`}
                        >
                          {p.roleGroup}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
                        {p.offToday && (
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            off today
                          </span>
                        )}
                        {p.weekoff && <span>off: {p.weekoff}</span>}
                        {p.shift && <span>· {p.shift}</span>}
                        {p.activePieces > 0 && (
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            · {p.activePieces} in flight
                          </span>
                        )}
                        {p.dailyTarget != null && <span>· target {p.dailyTarget}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {byDivision.size === 0 && (
            <p className="py-8 text-center text-xs text-gray-400">
              No roster rows synced yet
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <AlertTriangle size={14} className="text-amber-500" />
            Quiet Roster Members
          </h2>
          <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
            Rostered writers and editors with no activity for 3+ days in this window
          </p>
          <div className="space-y-1">
            {data.idle.map((p) => (
              <div
                key={`${p.division}-${p.name}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs odd:bg-gray-50/60 dark:odd:bg-gray-800/30"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                  <span className="ml-1.5 text-gray-400">{p.division}</span>
                </span>
                <span className="shrink-0 text-gray-400">
                  {p.daysIdle == null ? "never seen" : `${p.daysIdle}d idle`}
                </span>
              </div>
            ))}
            {data.idle.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">
                Everyone on the roster has been active
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <UserX size={14} className="text-rose-500" />
            Working but Not Rostered
          </h2>
          <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
            Names in the work log that no Division Info tab lists — usually a roster
            that has fallen behind
          </p>
          <div className="space-y-1">
            {data.unrostered.map((p) => (
              <div
                key={`${p.division}-${p.name}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs odd:bg-gray-50/60 dark:odd:bg-gray-800/30"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                  <span className="ml-1.5 text-gray-400">{p.division}</span>
                </span>
                <span className="shrink-0 tabular-nums text-gray-400">
                  {fmtInt(p.pieces)} pieces
                </span>
              </div>
            ))}
            {data.unrostered.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">
                Every active name is on a roster
              </p>
            )}
          </div>
        </div>
      </div>

      {data.nameVariants.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <Users size={14} className="text-violet-500" />
            Possibly the Same Person
          </h2>
          <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
            Similar names recorded in different divisions. These are counted
            separately on purpose — across divisions a shared first name can be
            two different people. Add the full name to both Division Info tabs
            to have them merged.
          </p>
          <div className="space-y-1.5">
            {data.nameVariants.map((g) => (
              <div
                key={g.variants.map((v) => v.name).join("|")}
                className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 text-xs odd:bg-gray-50/60 dark:odd:bg-gray-800/30"
              >
                {g.variants.map((v, i) => (
                  <span key={v.name} className="flex items-center gap-2">
                    {i > 0 && <span className="text-gray-300">vs</span>}
                    <span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {v.name}
                      </span>
                      <span className="ml-1 text-gray-400">
                        {v.division} · {fmtInt(v.pieces)}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
