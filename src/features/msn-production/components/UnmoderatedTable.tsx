"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ModerationBucket, ModerationResult } from "../types";

interface Props {
  data?: ModerationResult;
  isLoading: boolean;
}

const BUCKET_LABEL: Record<ModerationBucket, string> = {
  never: "Never",
  "over-month": ">1 month",
  "over-2w": ">2 weeks",
};

const BUCKET_CLASS: Record<ModerationBucket, string> = {
  never: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "over-month": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "over-2w": "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500",
};

type BucketFilter = "all" | ModerationBucket;

export default function UnmoderatedTable({ data, isLoading }: Props) {
  const [bucket, setBucket] = useState<BucketFilter>("all");
  const [publishedOnly, setPublishedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let list = data?.unmoderated ?? [];
    if (bucket !== "all") list = list.filter((p) => p.bucket === bucket);
    if (publishedOnly) list = list.filter((p) => p.isPublished);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.writer.toLowerCase().includes(q) ||
          p.allottedBy.toLowerCase().includes(q) ||
          p.feed.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, bucket, publishedOnly, search]);

  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const counts = data.summary;
  const filters: { key: BucketFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.unmoderatedTotal },
    { key: "never", label: "Never", count: counts.never },
    { key: "over-month", label: ">1 month", count: counts.overMonth },
    { key: "over-2w", label: ">2 weeks", count: counts.over2w },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Unmoderated Titles
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Production titles with no recent pass through the moderation tool
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setBucket(f.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  bucket === f.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {f.label}
                <span className="ml-1 opacity-70 tabular-nums">{f.count}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPublishedOnly((v) => !v)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
              publishedOnly
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                : "border-gray-200 text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Live only
          </button>
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, writer…"
              className="w-44 rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-300 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-xs text-gray-400">
          {counts.unmoderatedTotal === 0
            ? "Every title in this period has a recent moderation check 🎉"
            : "No titles match the current filters"}
        </p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Writer</th>
                <th className="px-3 py-2 font-medium">Assigner</th>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 font-medium">Division</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Last check</th>
                <th className="px-3 py-2 text-right font-medium">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-[280px] px-3 py-2">
                    <span className="block truncate font-medium text-gray-700 dark:text-gray-300" title={p.title}>
                      {p.title}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {p.contentType} · {p.date ?? "no date"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.writer !== "Unknown" ? p.writer : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.allottedBy !== "Unknown" ? p.allottedBy : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.feed !== "Unknown" ? p.feed : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {p.category !== "Unknown" ? p.category : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={
                        p.isPublished
                          ? "font-medium text-rose-600 dark:text-rose-400"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      {p.publishingStatus !== "Unknown" ? p.publishingStatus : "WIP"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {p.daysSinceCheck !== null
                      ? `${Math.round(p.daysSinceCheck)}d ago`
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BUCKET_CLASS[p.bucket]}`}
                    >
                      {BUCKET_LABEL[p.bucket]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
