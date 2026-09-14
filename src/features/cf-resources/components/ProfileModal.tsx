"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2 } from "lucide-react";
import { updateCfResourceProfiles } from "@/lib/api";
import { useCfResourceProfiles } from "@/features/critical-flow/hooks/useCriticalFlowData";
import type { ResourceProfile } from "@/features/critical-flow/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * The one thing managers set in-app: each person's daily quota. Everything
 * else on the board is read from the sheets. Blank means "not set" and stays
 * that way — it is never coerced to 0.
 */
export default function ProfileModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useCfResourceProfiles(open);
  const [draft, setDraft] = useState<Record<string, ResourceProfile>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!data) return;
    const d: Record<string, ResourceProfile> = {};
    for (const p of data) d[p.key] = { ...p };
    setDraft(d);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (profiles: ResourceProfile[]) =>
      updateCfResourceProfiles(profiles.map((p) => ({ key: p.key, dailyQuota: p.dailyQuota, notes: p.notes }))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cf-resource-profiles"] });
      qc.invalidateQueries({ queryKey: ["cf-resource-board"] });
      qc.invalidateQueries({ queryKey: ["cf-resource-summary"] });
      onClose();
    },
  });

  const rows = useMemo(() => {
    const all = Object.values(draft).sort((a, b) => a.division.localeCompare(b.division) || a.name.localeCompare(b.name));
    const f = filter.toLowerCase();
    return f ? all.filter((r) => r.name.toLowerCase().includes(f) || r.division.toLowerCase().includes(f)) : all;
  }, [draft, filter]);

  if (!open) return null;

  const changed = data
    ? Object.values(draft).filter((d) => {
        const o = data.find((x) => x.key === d.key);
        return o && (o.dailyQuota !== d.dailyQuota || o.notes !== d.notes);
      })
    : [];

  const inputClass =
    "rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Daily quotas</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Per person. Leave blank for no quota — the board then judges by load alone.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter"
              className={`${inputClass} w-32`}
            />
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-xs text-gray-400"><Loader2 size={14} className="animate-spin" /> Loading…</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Division</th>
                  <th className="px-3 py-2 text-right font-medium">Daily quota</th>
                  <th className="px-3 py-2 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-4 py-1.5 font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">{r.division}</td>
                    <td className="px-3 py-1.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={r.dailyQuota ?? ""}
                        placeholder="—"
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [r.key]: { ...d[r.key], dailyQuota: e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value))) },
                          }))
                        }
                        className={`${inputClass} w-16 text-right tabular-nums`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        value={r.notes}
                        onChange={(e) => setDraft((d) => ({ ...d, [r.key]: { ...d[r.key], notes: e.target.value } }))}
                        placeholder="e.g. half day Fridays"
                        className={`${inputClass} w-full`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
          <span className="text-[11px] text-gray-400">
            {changed.length ? `${changed.length} change${changed.length > 1 ? "s" : ""}` : "No changes"}
            {mutation.isError && <span className="ml-2 text-rose-500">Save failed</span>}
          </span>
          <button
            disabled={!changed.length || mutation.isPending}
            onClick={() => mutation.mutate(changed)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
