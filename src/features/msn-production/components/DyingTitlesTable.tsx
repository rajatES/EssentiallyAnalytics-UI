"use client";

import { useMemo, useState } from "react";
import { Skull, Search } from "lucide-react";
import type { InsightsResult, DeadTitleEntry } from "../types";
import { useTableSort, SortableTh } from "./SortableHeader";

interface Props {
  data?: InsightsResult;
  isLoading: boolean;
}

type TypeFilter = "all" | "killed" | "abandoned";

const STAGE_RANK: Record<string, number> = {
  "Never picked": 0,
  "While writing": 1,
  "Awaiting review": 2,
  "In review": 3,
  "After review": 4,
};

const STAGE_CLASS: Record<string, string> = {
  "Never picked": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  "While writing":
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Awaiting review":
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "In review":
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  "After review": "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

const dash = (v: string) => (v && v !== "Unknown" ? v : "—");

export default function DyingTitlesTable({ data, isLoading }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const all = useMemo(() => data?.dropAnalysis.titles ?? [], [data]);

  const filtered = useMemo(() => {
    let list: DeadTitleEntry[] = all;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.writer.toLowerCase().includes(q) ||
          t.allottedBy.toLowerCase().includes(q) ||
          t.editor.toLowerCase().includes(q) ||
          t.feed.toLowerCase().includes(q),
      );
    }
    return list;
  }, [all, typeFilter, search]);

  const { sorted, sortKey, sortDir, handleSort } = useTableSort(
    filtered,
    (t, key) => {
      switch (key) {
        case "title":
          return t.title;
        case "category":
          return dash(t.category) === "—" ? null : t.category;
        case "feed":
          return dash(t.feed) === "—" ? null : t.feed;
        case "writer":
          return dash(t.writer) === "—" ? null : t.writer;
        case "allottedBy":
          return dash(t.allottedBy) === "—" ? null : t.allottedBy;
        case "editor":
          return dash(t.editor) === "—" ? null : t.editor;
        case "stage":
          return STAGE_RANK[t.stage] ?? 99;
        case "type":
          return t.type;
        case "ageDays":
          return t.ageDays;
        default:
          return null;
      }
    },
  );

  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const killed = all.filter((t) => t.type === "killed").length;
  const abandoned = all.length - killed;
  const filters: { key: TypeFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    { key: "killed", label: "Killed", count: killed },
    { key: "abandoned", label: "Abandoned", count: abandoned },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Skull size={14} className="text-rose-500" />
            Dead & Abandoned Titles
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Every killed or stalled piece and the writer, allotter and editor
            accountable for it
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  typeFilter === f.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {f.label}
                <span className="ml-1 opacity-70 tabular-nums">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, person…"
              className="w-44 rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-300 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-xs text-gray-400">
          {all.length === 0
            ? "Nothing died in this period 🎉"
            : "No titles match the current filters"}
        </p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <SortableTh label="Title" colKey="title" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Division" colKey="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Feed" colKey="feed" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Writer" colKey="writer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Allotter" colKey="allottedBy" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Editor" colKey="editor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Died at" colKey="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Type" colKey="type" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Age" colKey="ageDays" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {sorted.map((t, i) => (
                <tr key={`${t.title}-${i}`}>
                  <td className="max-w-[260px] px-3 py-2">
                    <span
                      className="block truncate font-medium text-gray-700 dark:text-gray-300"
                      title={t.title}
                    >
                      {t.title}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {dash(t.category)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {dash(t.feed)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {dash(t.writer)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {dash(t.allottedBy)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500 dark:text-gray-400">
                    {dash(t.editor)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        STAGE_CLASS[t.stage] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {t.stage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={`font-medium ${
                        t.type === "killed"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {t.type === "killed" ? "Killed" : "Abandoned"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {t.ageDays !== null ? `${t.ageDays}d` : "—"}
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
