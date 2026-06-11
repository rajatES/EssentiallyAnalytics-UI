"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import type { InsightsResult, WriterQuadrantEntry } from "../types";
import { fmtHours, fmtPct } from "../format";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

function rateColor(publishRate: number): string {
  if (publishRate >= 70) return "#10b981"; // emerald
  if (publishRate >= 40) return "#f59e0b"; // amber
  return "#f43f5e"; // rose
}

function QuadrantTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const w: WriterQuadrantEntry = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-1 font-semibold text-gray-900 dark:text-white">{w.writer}</p>
      <p className="text-gray-500 dark:text-gray-400">
        Pieces: <span className="font-medium tabular-nums">{w.pieces}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        Median write: <span className="font-medium">{fmtHours(w.medianWriteHours)}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        Publish rate: <span className="font-medium">{fmtPct(w.publishRate)}</span>
      </p>
      {w.sentBackRate > 0 && (
        <p className="text-rose-500">Dropped/sent back: {fmtPct(w.sentBackRate)}</p>
      )}
    </div>
  );
}

function medianOf(vals: number[]): number {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

export default function WriterQuadrant({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const writers = data.writerQuadrant;
  const medPieces = medianOf(writers.map((w) => w.pieces));
  const medWrite = medianOf(writers.map((w) => w.medianWriteHours));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Writer Performance Map
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Volume vs writing speed — bottom-right is the sweet spot (high output,
          fast turnaround). Dot color = publish rate.
        </p>
      </div>

      {writers.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          Not enough data (writers need ≥3 pieces in the period)
        </p>
      ) : (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af22" />
                <XAxis
                  type="number"
                  dataKey="pieces"
                  name="Pieces"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Pieces →",
                    position: "insideBottomRight",
                    offset: -2,
                    fontSize: 10,
                    fill: "#9ca3af",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="medianWriteHours"
                  name="Write time"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Write hrs",
                    angle: -90,
                    position: "insideLeft",
                    offset: 24,
                    fontSize: 10,
                    fill: "#9ca3af",
                  }}
                />
                <ReferenceLine x={medPieces} stroke="#9ca3af44" strokeDasharray="4 4" />
                <ReferenceLine y={medWrite} stroke="#9ca3af44" strokeDasharray="4 4" />
                <Tooltip content={<QuadrantTooltip />} />
                <Scatter data={writers} fillOpacity={0.85}>
                  {writers.map((w) => (
                    <Cell key={w.writer} fill={rateColor(w.publishRate)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥70% published
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> 40–70%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> &lt;40%
            </span>
            <span className="ml-auto text-[11px] text-gray-300 dark:text-gray-600">
              dashed lines = team medians
            </span>
          </div>
        </>
      )}
    </div>
  );
}
