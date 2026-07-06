"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2 } from "lucide-react";
import { fetchMsnReportTargets, updateMsnReportTargets } from "@/lib/api";
import type { ReportTarget } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Draft = Record<string, ReportTarget>;

export default function TargetsModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ReportTarget[]>({
    queryKey: ["msn-report-targets"],
    queryFn: fetchMsnReportTargets,
    enabled: open,
  });

  const [draft, setDraft] = useState<Draft>({});
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    const d: Draft = {};
    for (const t of data) d[t.publication] = { ...t };
    setDraft(d);
    setOrder(data.map((t) => t.publication));
  }, [data]);

  const mutation = useMutation({
    mutationFn: (targets: ReportTarget[]) => updateMsnReportTargets(targets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msn-reports-config"] });
      queryClient.invalidateQueries({ queryKey: ["msn-report-targets"] });
      onClose();
    },
  });

  if (!open) return null;

  const setField = (
    pub: string,
    field: "articleTarget" | "slideshowTarget" | "videoTarget",
    value: string,
  ) => {
    const n = Math.max(0, Math.round(Number(value) || 0));
    setDraft((prev) => ({ ...prev, [pub]: { ...prev[pub], [field]: n } }));
  };

  const inputClass =
    "w-16 rounded-md border border-gray-200 bg-white px-2 py-1 text-right text-xs tabular-nums text-gray-700 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Daily targets
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Per-feed production targets used across the reports
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-900 dark:text-gray-500">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2 pr-3 font-medium">Feed</th>
                  <th className="py-2 pr-3 text-center font-medium">Tier</th>
                  <th className="py-2 pr-3 text-right font-medium">Article</th>
                  <th className="py-2 pr-3 text-right font-medium">Slideshow</th>
                  <th className="py-2 text-right font-medium">Video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {order.map((pub) => {
                  const t = draft[pub];
                  if (!t) return null;
                  return (
                    <tr key={pub}>
                      <td className="py-1.5 pr-3 font-medium text-gray-700 dark:text-gray-300" title={pub}>
                        {t.shortName || pub}
                      </td>
                      <td className="py-1.5 pr-3 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                        {t.tier || "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={t.articleTarget}
                          onChange={(e) => setField(pub, "articleTarget", e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={t.slideshowTarget}
                          onChange={(e) => setField(pub, "slideshowTarget", e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      <td className="py-1.5 text-right">
                        <input
                          type="number"
                          min={0}
                          value={t.videoTarget}
                          onChange={(e) => setField(pub, "videoTarget", e.target.value)}
                          className={inputClass}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {mutation.isError ? (
              <span className="text-rose-500">Save failed — try again.</span>
            ) : (
              "Changes apply to every report immediately."
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate(Object.values(draft))}
              disabled={mutation.isPending || isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save targets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
