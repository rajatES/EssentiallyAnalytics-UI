import { useMemo, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadRowsCsv } from "@/lib/tableCsv";
import { getPlatform, type TrafficPlatformKey } from "@/lib/traffic-platforms";
import type { TopPageRow } from "@/lib/api";
import { titleFromPath } from "../pageTitle";
import { sortGroupEntries } from "../groupOrder";
import React from "react";

interface TopPagesTableProps {
  rows: TopPageRow[];
  platform: TrafficPlatformKey;
  loading?: boolean;
  siteOrigin?: string;
}

type GroupMode = "flat" | "section" | "team";

/**
 * Landing-page breakdown for the selected platform.
 *
 * The medium-based table above this one can't segment untagged organic traffic
 * — every organic session carries medium 'referral', so it collapses to a single
 * row. Grouping by the page each session landed on is what makes that traffic
 * readable, and it needs no UTM tagging or page mappings to work.
 */
export function TopPagesTable({
  rows,
  platform,
  loading,
  siteOrigin = "https://www.essentiallysports.com",
}: TopPagesTableProps) {
  const [groupMode, setGroupMode] = useState<GroupMode>("section");
  // Tracks which sections are OPEN rather than which are closed, so the table
  // starts fully collapsed — there are hundreds of article rows, and the section
  // totals are the useful first view. Also avoids needing an effect to collapse
  // groups that only exist once data has loaded.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => ({
          sessions: a.sessions + r.sessions,
          pageviews: a.pageviews + r.pageviews,
          users: a.users + r.users,
        }),
        { sessions: 0, pageviews: 0, users: 0 },
      ),
    [rows],
  );

  const grouped = useMemo(() => {
    const map: Record<
      string,
      { rows: TopPageRow[]; sessions: number; users: number; pageviews: number }
    > = {};
    for (const r of rows) {
      const key =
        groupMode === "team"
          ? r.team?.trim() || "Unassigned"
          : r.section || "Other";
      (map[key] ??= { rows: [], sessions: 0, users: 0, pageviews: 0 });
      map[key].rows.push(r);
      map[key].sessions += r.sessions;
      map[key].users += r.users;
      map[key].pageviews += r.pageviews;
    }
    return sortGroupEntries(
      Object.entries(map),
      (a, b) => b[1].sessions - a[1].sessions,
    );
  }, [rows, groupMode]);

  const allCollapsed = expanded.size === 0;

  const toggleAll = () =>
    setExpanded(allCollapsed ? new Set(grouped.map(([name]) => name)) : new Set());

  const toggle = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const share = (n: number) => (totals.sessions ? (n / totals.sessions) * 100 : 0);

  const handleExport = () => {
    downloadRowsCsv(
      ["Section", "Mapped Page", "Team", "Page Path", "Sessions", "Users", "Pageviews", "% of Sessions"],
      rows.map((r) => [
        r.section,
        r.pageName ?? "",
        r.team ?? "",
        r.page_path,
        r.sessions,
        r.users,
        r.pageviews,
        share(r.sessions).toFixed(2),
      ]),
      `${getPlatform(platform).shortLabel.toLowerCase()}-landing-pages`,
    );
  };

  const renderRow = (r: TopPageRow, indent = false) => (
    <tr
      key={r.page_path}
      className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group"
    >
      <td className={cn("px-4 py-2", indent && "pl-9")}>
        <div className="flex items-center gap-2 max-w-[460px]">
          <span
            className="truncate text-gray-700 dark:text-gray-300"
            title={r.page_path}
          >
            {titleFromPath(r.page_path)}
          </span>
          {r.pageName && (
            <span
              className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900"
              title={`Matched by pattern ${r.matchedPattern}`}
            >
              {r.pageName}
            </span>
          )}
          {r.team && groupMode !== "team" && (
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900">
              {r.team}
            </span>
          )}
          <a
            href={`${siteOrigin}${r.page_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity shrink-0"
            title={`Open ${r.page_path}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="text-[10px] text-gray-400 truncate max-w-[460px]" title={r.page_path}>
          {r.page_path}
        </div>
      </td>
      <td className="px-4 py-2 text-right font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
        {r.sessions.toLocaleString()}
      </td>
      <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums">
        {r.users.toLocaleString()}
      </td>
      <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums">
        {r.pageviews.toLocaleString()}
      </td>
      <td className="px-4 py-2 text-right w-36">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(share(r.sessions), 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 tabular-nums w-10 text-right">
            {share(r.sessions).toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col max-h-[640px] overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              Top Landing Pages
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Where {getPlatform(platform).label} sessions started — works without UTM tagging
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 gap-1.5">
          {(["section", "team", "flat"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setGroupMode(m)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all",
                groupMode === m
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              {m === "section" ? "By Section" : m === "team" ? "By Team" : "All Pages"}
            </button>
          ))}
          <button
            onClick={toggleAll}
            disabled={groupMode === "flat" || !rows.length}
            title={allCollapsed ? "Expand all sections" : "Collapse all sections"}
            className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors shadow-sm ring-1 ring-black/5 dark:ring-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allCollapsed ? (
              <ChevronsUpDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronsDownUp className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {allCollapsed ? "Expand all" : "Collapse all"}
            </span>
          </button>
          <button
            onClick={handleExport}
            disabled={!rows.length}
            className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
            <tr>
              <th className="px-4 py-2.5 font-semibold tracking-wider">Page</th>
              <th className="px-4 py-2.5 text-right font-semibold min-w-[84px]">Sessions</th>
              <th className="px-4 py-2.5 text-right font-semibold min-w-[84px]">Users</th>
              <th className="px-4 py-2.5 text-right font-semibold min-w-[84px]">Views</th>
              <th className="px-4 py-2.5 text-right font-semibold w-36">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading landing pages…
                </td>
              </tr>
            ) : !rows.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No landing-page data for this range yet.
                </td>
              </tr>
            ) : groupMode === "flat" ? (
              rows.map((r) => renderRow(r))
            ) : (
              grouped.map(([section, g]) => {
                const isOpen = expanded.has(section);
                return (
                  <React.Fragment key={section}>
                    <tr
                      className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => toggle(section)}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                            {section}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {g.rows.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                        {g.sessions.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300 tabular-nums">
                        {g.users.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300 tabular-nums">
                        {g.pageviews.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 tabular-nums">
                        {share(g.sessions).toFixed(1)}%
                      </td>
                    </tr>
                    {isOpen && g.rows.map((r) => renderRow(r, true))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
