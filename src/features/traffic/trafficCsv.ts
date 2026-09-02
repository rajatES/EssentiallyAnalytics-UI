import { format, parseISO } from "date-fns";
import { AggregatedPageData } from "@/types";
import { DEFAULT_PLATFORM_KEY, getPlatform, type TrafficPlatformKey } from "@/lib/traffic-platforms";

/** How much of the breakdown table an export carries.
 *  - `asShown`  mirrors the table's current expand/collapse state
 *  - `full`     every group with every page nested underneath
 *  - `summary`  one row per group, no pages and no daily columns */
export type TrafficExportMode = "asShown" | "full" | "summary";

export type TrafficMetricType =
  | "sessions"
  | "users"
  | "pageviews"
  | "engagement_rate";

/** Running totals for one group, or for one (group, date) cell. `engagement_sum`
 *  over `count` is how the table averages a rate across its child pages. */
export interface TrafficTotals {
  sessions: number;
  users: number;
  pageviews: number;
  engagement_sum: number;
  count: number;
}

export interface TrafficGroup {
  rows: AggregatedPageData[];
  totals: TrafficTotals;
  dailyTotals: Record<string, TrafficTotals>;
}

/** A group name paired with its bucket, in the order the table renders them. */
export type TrafficGroupEntry = [string, TrafficGroup];

interface BuildOptions {
  mode: TrafficExportMode;
  groups: TrafficGroupEntry[];
  /** ISO days, in the column order the table shows them. */
  dateHeaders: string[];
  /** Metric the daily columns carry — the table's grid-metric toggle. */
  metric: TrafficMetricType;
  /** Which dimension the rows are grouped by. */
  viewMode: "category" | "team";
  /** Groups the user has collapsed; only consulted for `asShown`. */
  collapsedGroups: Set<string>;
  platform?: TrafficPlatformKey;
}

// Quote a field only when it contains a comma, quote or newline — keeps plain
// labels/numbers unquoted so the output matches the reference report layout.
function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Page names sit indented under their group, so they must always be quoted —
// an unquoted leading space is stripped by most spreadsheet importers.
function csvIndented(value: string): string {
  return `"  ${String(value).replace(/"/g, '""')}"`;
}

// Engagement stays a 0-1 fraction everywhere in the export (0.55 = 55%),
// rounded so a cell reads 0.5533 instead of a full float tail.
function csvRate(value: number): number {
  return Number(value.toFixed(4));
}

function dateRangeLabel(dateHeaders: string[]): string {
  if (!dateHeaders.length) return format(new Date(), "d MMMM");
  const first = parseISO(dateHeaders[0]);
  const last = parseISO(dateHeaders[dateHeaders.length - 1]);
  return dateHeaders.length === 1
    ? format(first, "d MMMM")
    : `${format(first, "d MMMM")} - ${format(last, "d MMMM")}`;
}

/** A group's value for one date column. Engagement is the mean of its pages'
 *  rates, the same average the group header row shows. */
function groupCell(
  totals: TrafficTotals | undefined,
  metric: TrafficMetricType,
): number {
  if (!totals) return 0;
  if (metric === "engagement_rate")
    return csvRate(totals.engagement_sum / (totals.count || 1));
  return totals[metric] || 0;
}

function pageCell(
  row: AggregatedPageData,
  dateStr: string,
  metric: TrafficMetricType,
): number {
  const day = row.dailyTrend.find((d) => d.date === dateStr);
  if (!day) return 0;
  if (metric === "engagement_rate") return csvRate(day.engagement_rate);
  return day[metric] || 0;
}

/** Per-date grand totals, folded up from the group buckets so the Total row
 *  averages engagement the same way each group row does. */
function grandDailyTotals(
  groups: TrafficGroupEntry[],
): Record<string, TrafficTotals> {
  const out: Record<string, TrafficTotals> = {};
  for (const [, group] of groups) {
    for (const [date, day] of Object.entries(group.dailyTotals)) {
      const acc = (out[date] ??= {
        sessions: 0,
        users: 0,
        pageviews: 0,
        engagement_sum: 0,
        count: 0,
      });
      acc.sessions += day.sessions;
      acc.users += day.users;
      acc.pageviews += day.pageviews;
      acc.engagement_sum += day.engagement_sum;
      acc.count += day.count;
    }
  }
  return out;
}

/** How many page rows `asShown` would write — drives the row counts the export
 *  dialog previews next to each option. */
export function expandedPageCount(
  groups: TrafficGroupEntry[],
  collapsedGroups: Set<string>,
): number {
  return groups.reduce(
    (n, [name, group]) => n + (collapsedGroups.has(name) ? 0 : group.rows.length),
    0,
  );
}

/**
 * Serializes the breakdown table at the requested depth.
 *
 * `summary` is the original group-totals report; the other two add the nested
 * page rows and one column per day, so the file carries what the table shows
 * rather than just its group headers.
 */
export function buildTrafficCsv({
  mode,
  groups,
  dateHeaders,
  metric,
  viewMode,
  collapsedGroups,
  platform,
}: BuildOptions): string {
  const isTeamView = viewMode === "team";
  const label = getPlatform(platform ?? DEFAULT_PLATFORM_KEY).shortLabel;

  const showPagesOf = (groupName: string) =>
    mode === "full" || (mode === "asShown" && !collapsedGroups.has(groupName));
  const withPages = groups.some(([name]) => showPagesOf(name));
  const withDates = mode !== "summary" && dateHeaders.length > 0;

  const metricName = metric.replace("_", " ");
  const title = `${label} - Traffic Report - ${dateRangeLabel(dateHeaders)}${
    withDates ? ` (daily columns: ${metricName})` : ""
  }`;

  const lines = [
    csvField(title),
    [
      isTeamView ? "Team / Page Name" : "Category / Page Name",
      // Repeated on every page row so the file can be pivoted without relying
      // on the group header sitting above it.
      ...(withPages ? ["Category", "Team"] : []),
      "Total Sessions",
      "Total Users",
      "Total Pageviews",
      "Avg Engagement Rate",
      ...(withDates ? dateHeaders : []),
    ]
      .map(csvField)
      .join(","),
  ];

  let totalSessions = 0;
  let totalUsers = 0;
  let totalPageviews = 0;
  let engagementBySessions = 0;

  for (const [groupName, group] of groups) {
    const { rows, totals, dailyTotals } = group;
    const avgEngagement = totals.engagement_sum / (totals.count || 1);

    // A group header row carries only the dimension it groups by; the other is
    // a mix of values, which is why the table leaves that badge off too.
    lines.push(
      [
        csvField(groupName),
        ...(withPages
          ? [
              csvField(isTeamView ? "" : groupName),
              csvField(isTeamView ? groupName : ""),
            ]
          : []),
        totals.sessions,
        totals.users,
        totals.pageviews,
        csvRate(avgEngagement),
        ...(withDates
          ? dateHeaders.map((date) => groupCell(dailyTotals[date], metric))
          : []),
      ].join(","),
    );

    totalSessions += totals.sessions;
    totalUsers += totals.users;
    totalPageviews += totals.pageviews;
    engagementBySessions += avgEngagement * totals.sessions;

    if (!showPagesOf(groupName)) continue;

    for (const row of rows) {
      lines.push(
        [
          csvIndented(row.pageName),
          csvField(row.category || "Other"),
          csvField(row.team?.trim() || "Unassigned"),
          row.totals.sessions,
          row.totals.users,
          row.totals.pageviews,
          csvRate(row.totals.engagement_rate_avg),
          ...(withDates
            ? dateHeaders.map((date) => pageCell(row, date, metric))
            : []),
        ].join(","),
      );
    }
  }

  // Session-weighted average so the grand total reflects high-traffic groups.
  const totalEngagement = totalSessions
    ? engagementBySessions / totalSessions
    : 0;
  const grandDaily = withDates ? grandDailyTotals(groups) : {};

  lines.push(
    [
      csvField("Total"),
      ...(withPages ? ["", ""] : []),
      totalSessions,
      totalUsers,
      totalPageviews,
      csvRate(totalEngagement),
      ...(withDates
        ? dateHeaders.map((date) => groupCell(grandDaily[date], metric))
        : []),
    ].join(","),
  );

  return lines.join("\n");
}

/** Filename stem for an export — triggerCsvDownload() adds the date and the
 *  extension. Platform and depth are in the name so exporting FB, Threads and
 *  Reddit in a row doesn't produce three files that differ only by "(1)". */
export function trafficCsvFilename(
  platform: TrafficPlatformKey | undefined,
  mode: TrafficExportMode,
): string {
  const slug = getPlatform(platform ?? DEFAULT_PLATFORM_KEY)
    .shortLabel.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const depth =
    mode === "summary" ? "summary" : mode === "full" ? "full" : "detailed";
  return `${slug}_traffic_report_${depth}`;
}
