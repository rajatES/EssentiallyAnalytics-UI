"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { InsightsResult, MomentumEntry } from "../types";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

/** Tiny inline sparkline for a 6-point weekly series. */
function Sparkline({ weekly, tone }: { weekly: number[]; tone: string }) {
  const max = Math.max(...weekly, 1);
  const W = 64;
  const H = 20;
  const step = W / (weekly.length - 1);
  const points = weekly
    .map((v, i) => `${i * step},${H - 2 - (v / max) * (H - 4)}`)
    .join(" ");
  return (
    <svg width={W} height={H} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MomentumRow({ m }: { m: MomentumEntry }) {
  const up = m.direction === "up";
  const down = m.direction === "down";
  const tone = up ? "#10b981" : down ? "#f43f5e" : "#9ca3af";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-32 shrink-0 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
        {m.name}
      </span>
      <Sparkline weekly={m.weekly} tone={tone} />
      <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
        {m.weekly[m.weekly.length - 1]} this wk
      </span>
      <span
        className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
          up
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            : down
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {up ? <TrendingUp size={11} /> : down ? <TrendingDown size={11} /> : null}
        {m.trendPct > 0 ? "+" : ""}
        {Math.round(m.trendPct)}%
      </span>
    </div>
  );
}

export default function MomentumBoard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const rising = data.momentum.filter((m) => m.direction === "up").slice(0, 6);
  const falling = data.momentum
    .filter((m) => m.direction === "down")
    .slice(-6)
    .reverse();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Momentum
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Published output, last 6 weeks — latest week vs prior average
        </p>
      </div>

      {data.momentum.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          Not enough recent publishing data
        </p>
      ) : (
        <div className="space-y-4">
          {rising.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Gaining
              </p>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {rising.map((m) => (
                  <MomentumRow key={m.name} m={m} />
                ))}
              </div>
            </div>
          )}
          {falling.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">
                Fading
              </p>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {falling.map((m) => (
                  <MomentumRow key={m.name} m={m} />
                ))}
              </div>
            </div>
          )}
          {rising.length === 0 && falling.length === 0 && (
            <p className="py-6 text-center text-xs text-gray-400">
              Everyone is steady — no big swings either way
            </p>
          )}
        </div>
      )}
    </div>
  );
}
