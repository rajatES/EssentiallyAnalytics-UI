"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { KpiOverview, StageBoardResult } from "../types";
import { fmtHours, fmtPct } from "../format";

interface Props {
  overview?: KpiOverview;
  board?: StageBoardResult;
  isLoading: boolean;
}

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  if (!value) return null;
  const good = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`flex items-center gap-0.5 text-[11px] font-medium ${
        good
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`}
    >
      <Icon size={11} />
      {Math.abs(value)}%
    </span>
  );
}

function Cell({
  label,
  value,
  sub,
  delta,
  invert,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  invert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
          {value}
        </span>
        {delta !== undefined && <Delta value={delta} invert={invert} />}
      </div>
      {sub && (
        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
      )}
    </div>
  );
}

export default function KpiHero({ overview, board, isLoading }: Props) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[92px] animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
          />
        ))}
      </div>
    );
  }

  // Backend "published" already counts scheduled work (it's locked to go live);
  // surface the live-vs-scheduled split beneath the headline.
  const live = Math.max(overview.published - overview.scheduled, 0);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Cell
        label="Allotted"
        value={String(overview.totalAllotted)}
        delta={overview.deltas.totalAllotted}
        sub="pieces in period"
      />
      <Cell
        label="Out the Door"
        value={String(overview.published)}
        delta={overview.deltas.published}
        sub={`${live} live · ${overview.scheduled} scheduled`}
      />
      <Cell
        label="Publish Rate"
        value={fmtPct(overview.publishRate)}
        delta={overview.deltas.publishRate}
        sub="of allotted pieces"
      />
      <Cell
        label="Median Cycle"
        value={fmtHours(overview.avgLeadTimeHours)}
        delta={overview.deltas.avgLeadTimeHours}
        invert
        sub="allot → publish"
      />
      <Cell
        label="In Progress"
        value={board ? String(board.totalWip) : "—"}
        sub={board ? `${board.doneLast24h} finished last 24h` : undefined}
      />
      <Cell
        label="Drop-off"
        value={fmtPct(overview.dropOffRate)}
        delta={overview.deltas.dropOffRate}
        invert
        sub="sent back / scrapped"
      />
    </div>
  );
}
