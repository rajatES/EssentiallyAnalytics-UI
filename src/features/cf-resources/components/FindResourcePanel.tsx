"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { ResourcePerson } from "@/features/critical-flow/types";
import { useCfResourceSuggest } from "@/features/critical-flow/hooks/useCriticalFlowData";
import StatusChip from "./StatusChip";

interface Props {
  open: boolean;
  onClose: () => void;
  divisions: string[];
  people: ResourcePerson[];
  date?: string;
  /** Pre-fill from a board row's "find cover" arrow. */
  initialDivision?: string;
  initialRole?: "writer" | "editor";
  initialForPerson?: string;
}

export default function FindResourcePanel({
  open, onClose, divisions, people, date, initialDivision, initialRole, initialForPerson,
}: Props) {
  const [division, setDivision] = useState(initialDivision ?? divisions[0] ?? "");
  const [role, setRole] = useState<"all" | "writer" | "editor">(initialRole ?? "all");
  const [forPerson, setForPerson] = useState(initialForPerson ?? "");

  const suggest = useCfResourceSuggest(
    { division, role, forPerson: forPerson || undefined, date },
    open,
  );

  if (!open) return null;

  const names = [...new Set(people.map((p) => p.name))].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Find a resource</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Ranked by named backup, then the Associate pool, then division fit, then room left today
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Division
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Role
            <div className="mt-1 flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
              {(["all", "writer", "editor"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize ${
                    role === r ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {r === "all" ? "Anyone" : r}
                </button>
              ))}
            </div>
          </div>
          <label className="flex-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Covering for (optional)
            <input
              list="cf-people"
              value={forPerson}
              onChange={(e) => setForPerson(e.target.value)}
              placeholder="Type a name to rank their named backup first"
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <datalist id="cf-people">{names.map((n) => <option key={n} value={n} />)}</datalist>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {suggest.isLoading && (
            <p className="flex items-center justify-center gap-2 py-10 text-xs text-gray-400"><Loader2 size={14} className="animate-spin" /> Ranking…</p>
          )}
          {suggest.data && suggest.data.candidates.length === 0 && (
            <p className="py-10 text-center text-xs text-gray-400">Nobody is available for {division} right now</p>
          )}
          {suggest.data?.candidates.map((c, i) => {
            const p = c.person;
            return (
              <div key={p.key} className="flex items-start gap-3 rounded-xl px-3 py-2.5 odd:bg-gray-50/60 dark:odd:bg-gray-800/30">
                <span className="mt-0.5 w-5 shrink-0 text-right text-[11px] tabular-nums text-gray-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
                    <StatusChip status={p.status} reason={p.statusReason} size="xs" />
                    <span className="text-[11px] text-gray-400">
                      {p.primaryDivision}{p.subFeed ? ` · ${p.subFeed}` : ""} · {p.roleGroup}{p.shift ? ` · ${p.shift}` : ""}
                    </span>
                  </div>
                  <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    {c.reasons.map((r) => (
                      <li key={r} className="text-[11px] text-gray-500 before:mr-1 before:text-gray-300 before:content-['•'] dark:text-gray-400">{r}</li>
                    ))}
                  </ul>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                    {p.roleGroup === "editor" ? p.queue : p.inFlight}
                  </span>
                  <span className="block text-[10px] text-gray-400">{p.roleGroup === "editor" ? "in queue" : "in flight"}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
