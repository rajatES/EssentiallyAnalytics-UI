"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AvailabilityResult, PersonAvailability } from "../types";

interface Props {
  data?: AvailabilityResult;
  isLoading: boolean;
}

function PersonCard({ p }: { p: PersonAvailability }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
          {p.name}
        </p>
        {p.publishedLast7Days > 0 && (
          <span
            className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            title="Published in the last 7 days"
          >
            {p.publishedLast7Days} this wk
          </span>
        )}
      </div>
      <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">
        {p.roles.length ? p.roles.join(" · ") : "No role set"}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {p.divisions.map((d) => (
          <span
            key={d}
            className="rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-500 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700"
          >
            {d}
          </span>
        ))}
        {p.weekoff && (
          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-400 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-700">
            off: {p.weekoff.slice(0, 3)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AvailabilityBoard({ data, isLoading }: Props) {
  const [division, setDivision] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [showWeekoff, setShowWeekoff] = useState(false);

  const free = useMemo(() => {
    if (!data) return [];
    return data.people.filter(
      (p) =>
        p.status === "free" &&
        (division === "All" || p.divisions.includes(division)) &&
        (!query || p.name.toLowerCase().includes(query.toLowerCase())),
    );
  }, [data, division, query]);

  const weekoff = useMemo(() => {
    if (!data) return [];
    return data.people.filter(
      (p) =>
        p.status === "weekoff" &&
        (division === "All" || p.divisions.includes(division)),
    );
  }, [data, division]);

  if (isLoading || !data) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const divisions = ["All", ...data.divisions.map((d) => d.division)];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Free Right Now
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              {free.length}
            </span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            On roster, not on weekoff, and no piece currently assigned
          </p>
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="w-44 rounded-lg border border-gray-200 bg-transparent py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:text-gray-300"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {divisions.map((d) => (
          <button
            key={d}
            onClick={() => setDivision(d)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              division === d
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-50 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {free.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">
          Nobody free in this division right now
        </p>
      ) : (
        <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
          {free.map((p) => (
            <PersonCard key={p.name} p={p} />
          ))}
        </div>
      )}

      {weekoff.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            onClick={() => setShowWeekoff(!showWeekoff)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {showWeekoff ? "▾" : "▸"} On weekoff today ({weekoff.length})
          </button>
          {showWeekoff && (
            <p className="mt-2 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
              {weekoff.map((p) => p.name).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
