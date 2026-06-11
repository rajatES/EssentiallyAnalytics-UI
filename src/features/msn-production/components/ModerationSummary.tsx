"use client";

import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Activity } from "lucide-react";
import type { ModerationResult } from "../types";
import { fmtPct } from "../format";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

export default function ModerationSummary({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
          />
        ))}
      </div>
    );
  }

  const s = data.summary;

  const cards = [
    {
      label: "Coverage",
      value: fmtPct(s.coverageRate),
      sub: `${s.moderatedRecent}/${s.totalPieces} checked ≤2 wks`,
      icon: ShieldCheck,
      tone:
        s.coverageRate >= 80
          ? "text-emerald-600 dark:text-emerald-400"
          : s.coverageRate >= 50
            ? "text-amber-600 dark:text-amber-400"
            : "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Never Checked",
      value: String(s.never),
      sub: "no moderation record",
      icon: ShieldX,
      tone: s.never > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Stale >1 Month",
      value: String(s.overMonth),
      sub: "last check over 30 days ago",
      icon: ShieldAlert,
      tone: s.overMonth > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400",
    },
    {
      label: "Stale >2 Weeks",
      value: String(s.over2w),
      sub: "last check 14–30 days ago",
      icon: ShieldAlert,
      tone: s.over2w > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400",
    },
    {
      label: "Live & Unchecked",
      value: String(s.publishedUnmoderated),
      sub: "published/scheduled without a recent check",
      icon: AlertTriangle,
      tone:
        s.publishedUnmoderated > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Checks Run",
      value: String(s.totalChecks),
      sub: `${s.distinctTitlesChecked} titles · ${fmtPct(s.passRate)} passed`,
      icon: Activity,
      tone: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <c.icon size={13} className={c.tone} />
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {c.label}
            </span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${c.tone}`}>{c.value}</p>
          <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
