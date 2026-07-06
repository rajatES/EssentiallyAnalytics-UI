"use client";

import type { ReactNode } from "react";

// ── Shared building blocks for the syndication report views ──

export function LoadingBlock({ className = "h-96" }: { className?: string }) {
  return (
    <div
      className={`${className} animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50`}
    />
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ReportCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export const TH_BASE =
  "px-3 py-2 font-medium whitespace-nowrap" as const;
export const TD_NUM =
  "px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400" as const;
export const TD_NAME =
  "whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300" as const;

/** Sum a numeric field over rows, treating null as 0. */
export function sumBy<T>(rows: T[], pick: (r: T) => number | null): number {
  return rows.reduce((acc, r) => acc + (pick(r) ?? 0), 0);
}

/** Percentage tone: green ≥90, amber ≥70, red below. */
export function rateTone(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "text-gray-400 dark:text-gray-500";
  if (v >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (v >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}
