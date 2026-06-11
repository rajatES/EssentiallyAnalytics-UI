"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { DuplicatesResult, DuplicateAllotment } from "../types";

interface Props {
  data?: DuplicatesResult;
  isLoading: boolean;
}

function fmtDate(a: DuplicateAllotment): string {
  if (a.allottedAt) {
    const d = new Date(a.allottedAt);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return a.date ?? "—";
}

const STATUS_CLASS = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes("publish")) return "text-emerald-600 dark:text-emerald-400";
  if (s.includes("trash") || s.includes("scrap") || s.includes("sent back"))
    return "text-rose-600 dark:text-rose-400";
  return "text-gray-500 dark:text-gray-400";
};

export default function DuplicateTitlesTable({ data, isLoading }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  if (isLoading || !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const toggle = (title: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Duplicate Allotments
          <span className="ml-2 rounded-full bg-fuchsia-50 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400">
            {data.duplicateTitles} titles
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Same title handed out more than once — click a row for every allotment
        </p>
      </div>

      {data.titles.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">
          No duplicate allotments in this period 🎉
        </p>
      ) : (
        <div className="max-h-[520px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="w-6 px-2 py-2" />
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Division</th>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 font-medium">Writer</th>
                <th className="px-3 py-2 font-medium">Allotter</th>
                <th className="px-3 py-2 font-medium">First allotted</th>
                <th className="px-3 py-2 font-medium">Repeats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.titles.map((t) => {
                const expanded = open.has(t.title);
                const allFeeds = new Set([t.first.feed, ...t.repeats.map((r) => r.feed)]);
                const allWriters = new Set(
                  [t.first.writer, ...t.repeats.map((r) => r.writer)].filter(
                    (w) => w !== "Unknown",
                  ),
                );
                const allAllotters = new Set(
                  [t.first.allottedBy, ...t.repeats.map((r) => r.allottedBy)].filter(
                    (a) => a !== "Unknown",
                  ),
                );
                const label = (s: Set<string>) => {
                  const [firstVal] = s;
                  if (s.size === 0) return "—";
                  if (s.size === 1) return firstVal;
                  return `${firstVal} +${s.size - 1}`;
                };
                return (
                  <>
                    <tr
                      key={t.title}
                      onClick={() => toggle(t.title)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-2 py-2">
                        <ChevronRight
                          size={12}
                          className={`text-gray-300 transition-transform dark:text-gray-600 ${expanded ? "rotate-90" : ""}`}
                        />
                      </td>
                      <td className="max-w-[300px] px-3 py-2">
                        <span
                          className="block truncate font-medium text-gray-700 dark:text-gray-300"
                          title={t.title}
                        >
                          {t.title}
                        </span>
                        {t.crossFeed && (
                          <span className="text-[10px] font-medium text-fuchsia-600 dark:text-fuchsia-400">
                            cross-feed duplicate
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                        {t.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                        {label(allFeeds)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                        {label(allWriters)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                        {label(allAllotters)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-500 dark:text-gray-400">
                        {fmtDate(t.first)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="flex flex-wrap items-center gap-1">
                          <span className="rounded-full bg-fuchsia-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400">
                            {t.count}×
                          </span>
                          {t.repeats.slice(0, 3).map((r, i) => (
                            <span
                              key={i}
                              className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] tabular-nums text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              title={`${r.writer} · ${r.allottedBy} · ${r.feed}`}
                            >
                              {fmtDate(r)}
                            </span>
                          ))}
                          {t.repeats.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{t.repeats.length - 3}
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${t.title}-detail`} className="bg-gray-50/60 dark:bg-gray-800/40">
                        <td />
                        <td colSpan={7} className="px-3 py-2">
                          <div className="space-y-1">
                            {[t.first, ...t.repeats].map((a, i) => (
                              <div
                                key={i}
                                className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px]"
                              >
                                <span className="w-24 font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                                  {i === 0 ? "First" : `Repeat ${i}`}
                                </span>
                                <span className="w-28 tabular-nums text-gray-500 dark:text-gray-400">
                                  {fmtDate(a)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  ✍ {a.writer !== "Unknown" ? a.writer : "—"}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  by {a.allottedBy !== "Unknown" ? a.allottedBy : "—"}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {a.feed !== "Unknown" ? a.feed : "—"}
                                </span>
                                <span className={`font-medium ${STATUS_CLASS(a.status)}`}>
                                  {a.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
