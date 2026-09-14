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
import type { PendingResult } from "../types";
import { fmtInt } from "../format";

interface Props {
  data?: PendingResult;
  isLoading: boolean;
}

/** Bands beyond a day get progressively more alarming. */
const BAND_COLOR: Record<string, string> = {
  "< 4h": "#10b981",
  "4–12h": "#34d399",
  "12–24h": "#fbbf24",
  "1–3d": "#f59e0b",
  "3–7d": "#f97316",
  "> 7d": "#f43f5e",
};

export default function AgeBandChart({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const total = data.ageBands.reduce((s, b) => s + b.count, 0);
  const stale = data.ageBands
    .filter((b) => b.band === "3–7d" || b.band === "> 7d")
    .reduce((s, b) => s + b.count, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        How Long Work Has Been Waiting
      </h2>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        {stale > 0 ? (
          <>
            <span className="font-medium text-rose-500">{fmtInt(stale)}</span> of{" "}
            {fmtInt(total)} have been sitting for over 3 days
          </>
        ) : (
          `${fmtInt(total)} pieces in queue, none older than 3 days`
        )}
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.ageBands} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="band"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.1)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            formatter={(v) => [`${v ?? 0} pieces`, "Waiting"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.ageBands.map((b) => (
              <Cell key={b.band} fill={BAND_COLOR[b.band] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
