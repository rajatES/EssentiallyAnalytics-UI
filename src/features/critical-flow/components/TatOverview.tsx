"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Info } from "lucide-react";
import type { TatResult } from "../types";
import { fmtHours, fmtInt } from "../format";

interface Props {
  data?: TatResult;
  isLoading: boolean;
}

const BAND_COLOR: Record<string, string> = {
  "< 1h": "#10b981",
  "1–2h": "#34d399",
  "2–4h": "#6ee7b7",
  "4–8h": "#fbbf24",
  "8–24h": "#f59e0b",
  "1–3d": "#f97316",
  "> 3d": "#f43f5e",
};

export default function TatOverview({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const { overall } = data;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Turnaround
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Allotment through to publication, across {fmtInt(overall.count)} measured pieces
          </p>
        </div>
        <div className="flex gap-6">
          {[
            ["Median", overall.median],
            ["p90", overall.p90],
            ["Slowest", overall.max],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-[11px] uppercase tracking-wider text-gray-400">
                {label as string}
              </p>
              <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                {fmtHours(value as number)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.distribution} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="band" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.1)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            formatter={(v) => [`${v ?? 0} pieces`, "Count"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.distribution.map((b) => (
              <Cell key={b.band} fill={BAND_COLOR[b.band] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Per-leg medians */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Where the Time Goes
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {data.stages.map((s) => (
            <div
              key={s.stage}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/30"
            >
              <p className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400" title={s.stage}>
                {s.stage}
              </p>
              {s.median == null ? (
                <>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-400">
                    <Info size={12} /> not recorded
                  </p>
                  <p className="text-[10px] text-gray-400">
                    source has no usable timestamps for this leg
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                    {fmtHours(s.median)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    p90 {fmtHours(s.p90)} · {fmtInt(s.count)} pieces
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
