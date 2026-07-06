"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { EodReportRow, ReportsConfig } from "../../../types";
import { fmtPct } from "../../../format";
import { ReportCard } from "../shared";
import { shortName, tierOf } from "./helpers";

interface Props {
  rows: EodReportRow[];
  config?: ReportsConfig;
}

// Health/publish rates arrive as 0–100 (already normalised on ingest) OR as a
// 0–1 fraction depending on the source column; normalise to a percentage.
function pct(v: number | null): number | null {
  if (v == null) return null;
  return v <= 1 ? v * 100 : v;
}

const HEALTHY = 90;
const WARN = 70;

export default function FeedHealthWatch({ rows, config }: Props) {
  const { needsAttention, healthy } = useMemo(() => {
    const scored = rows
      .map((r) => ({
        pub: r.publication,
        health: pct(r.feedHealthRate),
        publish: pct(r.publishRate),
      }))
      .filter((r) => r.health != null || r.publish != null);

    const worst = (r: { health: number | null; publish: number | null }) =>
      Math.min(r.health ?? 101, r.publish ?? 101);

    const needsAttention = scored
      .filter((r) => worst(r) < HEALTHY)
      .sort((a, b) => worst(a) - worst(b));
    const healthyCount = scored.length - needsAttention.length;
    return { needsAttention, healthy: healthyCount };
  }, [rows]);

  const tone = (v: number | null) => {
    if (v == null) return "text-gray-400 dark:text-gray-500";
    if (v >= HEALTHY) return "text-emerald-600 dark:text-emerald-400";
    if (v >= WARN) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <ReportCard
      title="Feed health watch"
      subtitle={`Feeds below ${HEALTHY}% health or publish rate · ${healthy} healthy`}
    >
      {needsAttention.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} />
          All feeds healthy — nothing below {HEALTHY}%.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 text-right font-medium">Feed health</th>
                <th className="px-3 py-2 text-right font-medium">Publish rate</th>
                <th className="px-3 py-2 text-center font-medium">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {needsAttention.map((r) => (
                <tr key={r.pub} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5" title={r.pub}>
                      <AlertTriangle size={12} className="shrink-0 text-amber-500" />
                      {shortName(config, r.pub)}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-right font-medium tabular-nums ${tone(r.health)}`}>
                    {fmtPct(r.health)}
                  </td>
                  <td className={`px-3 py-2 text-right font-medium tabular-nums ${tone(r.publish)}`}>
                    {fmtPct(r.publish)}
                  </td>
                  <td className="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                    {tierOf(config, r.pub) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  );
}
