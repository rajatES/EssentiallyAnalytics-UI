import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import type { LeakageResult } from "../types";

interface Props {
  data: LeakageResult | undefined;
  isLoading: boolean;
}

function LeakageTable({ title, count, items, color }: {
  title: string;
  count: number;
  items: { title: string; date: string; writer: string; feed: string }[];
  color: "amber" | "red";
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, 20);
  const accent = color === "amber"
    ? { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" }
    : { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };

  return (
    <div className={`rounded-lg border ${accent.border} ${accent.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={14} className={accent.text} /> : <ChevronRight size={14} className={accent.text} />}
          <AlertTriangle size={14} className={accent.text} />
          <span className={`text-sm font-medium ${accent.text}`}>{title}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${accent.badge}`}>
          {count}
        </span>
      </button>

      {expanded && items.length > 0 && (
        <div className="border-t px-4 pb-3 pt-2 ${accent.border}">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="pb-1 pr-2 font-medium">Title</th>
                <th className="pb-1 pr-2 font-medium">Date</th>
                <th className="pb-1 pr-2 font-medium">Writer</th>
                <th className="pb-1 font-medium">Feed</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, i) => (
                <tr key={i} className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <td className="py-1.5 pr-2 text-gray-800 dark:text-gray-200 max-w-[260px] truncate">{item.title}</td>
                  <td className="py-1.5 pr-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.date}</td>
                  <td className="py-1.5 pr-2 text-gray-600 dark:text-gray-400">{item.writer}</td>
                  <td className="py-1.5 text-gray-600 dark:text-gray-400">{item.feed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 20 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {showAll ? "Show less" : `Show all ${items.length} items`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeakagePanel({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cross-Sheet Reconciliation</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  const totalLeakage = data.publishedWithoutAllotmentCount + data.allottedWithoutPublishCount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cross-Sheet Reconciliation</h3>
        {totalLeakage > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {totalLeakage} mismatches
          </span>
        )}
      </div>

      {totalLeakage === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-green-600 dark:text-green-400">
          All records reconciled — no leakage detected
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <LeakageTable
            title="Published without prior allotment"
            count={data.publishedWithoutAllotmentCount}
            items={data.publishedWithoutAllotment}
            color="amber"
          />
          <LeakageTable
            title="Allotted but never published"
            count={data.allottedWithoutPublishCount}
            items={data.allottedWithoutPublish}
            color="red"
          />
        </div>
      )}
    </div>
  );
}
