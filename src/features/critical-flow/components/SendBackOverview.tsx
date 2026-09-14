"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { SendBackResult } from "../types";
import { fmtDay, fmtHours, fmtInt, fmtPct, rateTone, AGE_TONE_CLASS } from "../format";

interface Props {
  data?: SendBackResult;
  isLoading: boolean;
}

export default function SendBackOverview({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const topReason = data.reasons[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Send-Backs
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Work returned to the writer after the first editorial pass
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Total</p>
            <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {fmtInt(data.total)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Rate</p>
            <p
              className={`mt-0.5 inline-block rounded px-2 py-0.5 text-lg font-bold tabular-nums ${
                AGE_TONE_CLASS[rateTone(data.rate)]
              }`}
            >
              {fmtPct(data.rate)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Still Open</p>
            <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {fmtInt(data.openSendBacks.length)}
            </p>
          </div>
          <div className="max-w-[180px]">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Top Reason</p>
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {topReason ? topReason.reason : "—"}
            </p>
            {topReason && (
              <p className="text-[11px] text-gray-400">
                {fmtPct(topReason.share)} of send-backs
              </p>
            )}
          </div>
        </div>
      </div>

      {data.trend.length > 1 && (
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data.trend} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
            <XAxis
              dataKey="bucket"
              tickFormatter={fmtDay}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={40}
              unit="%"
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              formatter={(v, n) => (n === "Rate" ? `${v ?? 0}%` : (v ?? 0))}
            />
            <Bar dataKey="sentBack" name="Sent Back" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              name="Rate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {data.reasons.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {data.reasons.map((r) => (
            <div key={r.reason} className="flex items-center gap-3">
              <span className="w-52 shrink-0 truncate text-[11px] text-gray-600 dark:text-gray-300" title={r.reason}>
                {r.reason}
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                <div className="h-full rounded bg-rose-400" style={{ width: `${r.share}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-gray-700 dark:text-gray-300">
                {r.count}
              </span>
              <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-gray-400">
                {r.medianReworkHours == null ? "—" : fmtHours(r.medianReworkHours)}
              </span>
            </div>
          ))}
          <p className="pt-1 text-right text-[10px] text-gray-400">
            right column: median time to come back
          </p>
        </div>
      )}
    </div>
  );
}
