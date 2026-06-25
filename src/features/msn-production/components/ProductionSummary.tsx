"use client";

import { ClipboardList, PenLine, BookCheck, Gauge, Zap } from "lucide-react";
import type { ProductionResult, ProductionCounts } from "../types";
import { fmtHours, fmtPct } from "../format";

interface Props {
  data?: ProductionResult;
  isLoading: boolean;
}

function breakdown(c: ProductionCounts): string {
  return `${c.articles.toLocaleString()} articles · ${c.slideshows.toLocaleString()} SS · ${c.slides.toLocaleString()} slides`;
}

export default function ProductionSummary({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
          />
        ))}
      </div>
    );
  }

  const s = data.summary;
  const pr = s.prPublished.pieces;

  const cards = [
    {
      label: "Allotted",
      value: s.allotted.pieces.toLocaleString(),
      sub: breakdown(s.allotted),
      icon: ClipboardList,
      tone: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Drafted",
      value: s.drafted.pieces.toLocaleString(),
      sub: breakdown(s.drafted),
      icon: PenLine,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Edited",
      value: s.edited.pieces.toLocaleString(),
      sub: `${fmtPct(s.editRate)} of reviewable drafts`,
      icon: BookCheck,
      tone: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "PR Published",
      value: pr.toLocaleString(),
      sub: pr > 0 ? "live without review — excluded from edit stats" : "none this period",
      icon: Zap,
      tone:
        pr > 0
          ? "text-violet-600 dark:text-violet-400"
          : "text-gray-400 dark:text-gray-500",
    },
    {
      label: "Efficiency",
      value: fmtPct(s.draftRate),
      sub: `${fmtPct(s.pickRate)} picked → ${fmtPct(s.draftRate)} drafted (of allotted) · write ${fmtHours(s.medianWriteHours)} · edit ${fmtHours(s.medianEditHours)}`,
      icon: Gauge,
      tone:
        s.draftRate >= 80
          ? "text-emerald-600 dark:text-emerald-400"
          : s.draftRate >= 50
            ? "text-amber-600 dark:text-amber-400"
            : "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
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
