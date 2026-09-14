"use client";

import type { ResourceStatus } from "@/features/critical-flow/types";

/** One colour per status, used by the board, the strip and the finder. */
export const STATUS_CLASS: Record<ResourceStatus, string> = {
  Off: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  Free: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Available: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "At capacity": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Busy: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Overloaded: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export const STATUS_DOT: Record<ResourceStatus, string> = {
  Off: "bg-gray-400",
  Free: "bg-emerald-500",
  Available: "bg-indigo-500",
  "At capacity": "bg-amber-500",
  Busy: "bg-amber-500",
  Overloaded: "bg-rose-500",
};

export const STATUS_ORDER: ResourceStatus[] = [
  "Free",
  "Available",
  "At capacity",
  "Busy",
  "Overloaded",
  "Off",
];

export default function StatusChip({
  status,
  reason,
  size = "sm",
}: {
  status: ResourceStatus;
  reason?: string;
  size?: "sm" | "xs";
}) {
  return (
    <span
      title={reason}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-medium ${
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      } ${STATUS_CLASS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}
