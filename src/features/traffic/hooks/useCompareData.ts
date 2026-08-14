import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  subDays,
  startOfToday,
  differenceInCalendarDays,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import {
  fetchAggregatedData,
  fetchTopPages,
  fetchPageMappings,
  processAggregatedData,
  type TopPageRow,
} from "@/lib/api";
import type { TrafficPlatformKey } from "@/lib/traffic-platforms";
import type { AggregatedPageData } from "@/types";

export interface DateRange {
  start: string;
  end: string;
}

/** One period's numbers for a single row or for the whole range. */
export interface MetricSet {
  sessions: number;
  users: number;
  pageviews: number;
  engagement: number;
}

export interface Compared {
  a: number;
  b: number;
  delta: number;
  pct: number | null;
}

export interface ComparedMetric extends Compared {
  key: keyof MetricSet;
  label: string;
}

export interface ComparedRow {
  key: string;
  label: string;
  sublabel?: string;
  a: MetricSet;
  b: MetricSet;
  /** Sessions comparison — what rows are sorted and coloured by. */
  primary: Compared;
}

const EMPTY: MetricSet = { sessions: 0, users: 0, pageviews: 0, engagement: 0 };

/** null pct = "no baseline", which the UI renders as "new" rather than +100%. */
function pctChange(a: number, b: number): number | null {
  if (!b) return a ? null : 0;
  return ((a - b) / b) * 100;
}

function compare(a: number, b: number): Compared {
  return { a, b, delta: a - b, pct: pctChange(a, b) };
}

function sumTotals(rows: AggregatedPageData[]): MetricSet {
  const t = rows.reduce(
    (acc, r) => ({
      sessions: acc.sessions + r.totals.sessions,
      users: acc.users + r.totals.users,
      pageviews: acc.pageviews + r.totals.pageviews,
      engagement: acc.engagement + r.totals.engagement_rate_avg,
    }),
    { ...EMPTY },
  );
  // Mean across pages, matching how the Overview tab presents engagement.
  return { ...t, engagement: rows.length ? t.engagement / rows.length : 0 };
}

function buildRows(
  currentA: Map<string, { label: string; sublabel?: string; metrics: MetricSet }>,
  currentB: Map<string, { label: string; sublabel?: string; metrics: MetricSet }>,
): ComparedRow[] {
  const keys = new Set([...currentA.keys(), ...currentB.keys()]);
  return Array.from(keys)
    .map((key) => {
      const ca = currentA.get(key);
      const cb = currentB.get(key);
      const a = ca?.metrics ?? EMPTY;
      const b = cb?.metrics ?? EMPTY;
      return {
        key,
        label: ca?.label ?? cb?.label ?? key,
        sublabel: ca?.sublabel ?? cb?.sublabel,
        a,
        b,
        primary: compare(a.sessions, b.sessions),
      };
    })
    .sort((x, y) => Math.max(y.a.sessions, y.b.sessions) - Math.max(x.a.sessions, x.b.sessions));
}

/** Total sessions/users per calendar day, summed across pages. */
function dailySeries(rows: AggregatedPageData[], range: DateRange) {
  const byDate: Record<string, { sessions: number; users: number }> = {};
  for (const page of rows) {
    for (const day of page.dailyTrend) {
      (byDate[day.date] ??= { sessions: 0, users: 0 });
      byDate[day.date].sessions += day.sessions;
      byDate[day.date].users += day.users;
    }
  }
  try {
    return eachDayOfInterval({
      start: parseISO(range.start),
      end: parseISO(range.end),
    }).map((d) => {
      const key = format(d, "yyyy-MM-dd");
      return { date: key, ...(byDate[key] ?? { sessions: 0, users: 0 }) };
    });
  } catch {
    return [];
  }
}

/**
 * Two independent date ranges fetched side by side.
 *
 * Deliberately reuses the existing endpoints rather than adding a compare API —
 * a comparison is just two reads and a subtraction, and keeping it client-side
 * means the Compare tab can never drift from what the Overview tab reports.
 */
export function useCompareData(platform: TrafficPlatformKey) {
  const yesterday = subDays(startOfToday(), 1);

  const [rangeA, setRangeA] = useState<DateRange>({
    start: format(subDays(yesterday, 6), "yyyy-MM-dd"),
    end: format(yesterday, "yyyy-MM-dd"),
  });
  const [rangeB, setRangeB] = useState<DateRange>({
    start: format(subDays(yesterday, 13), "yyyy-MM-dd"),
    end: format(subDays(yesterday, 7), "yyyy-MM-dd"),
  });

  const { data: mappings = [] } = useQuery({
    queryKey: ["mappings"],
    queryFn: fetchPageMappings,
    staleTime: 1000 * 60 * 60,
  });

  const mk = (r: DateRange, key: string) => ({
    queryKey: [key, platform, r.start, r.end],
    enabled: !!r.start && !!r.end,
  });

  const aggA = useQuery({
    ...mk(rangeA, "cmp-agg"),
    queryFn: () => fetchAggregatedData(rangeA.start, rangeA.end, platform),
  });
  const aggB = useQuery({
    ...mk(rangeB, "cmp-agg"),
    queryFn: () => fetchAggregatedData(rangeB.start, rangeB.end, platform),
  });
  const pagesA = useQuery({
    ...mk(rangeA, "cmp-pages"),
    queryFn: () => fetchTopPages(rangeA.start, rangeA.end, platform, 200),
  });
  const pagesB = useQuery({
    ...mk(rangeB, "cmp-pages"),
    queryFn: () => fetchTopPages(rangeB.start, rangeB.end, platform, 200),
  });

  const dataA = useMemo(
    () => processAggregatedData(aggA.data ?? [], platform, mappings),
    [aggA.data, mappings, platform],
  );
  const dataB = useMemo(
    () => processAggregatedData(aggB.data ?? [], platform, mappings),
    [aggB.data, mappings, platform],
  );

  const totalsA = useMemo(() => sumTotals(dataA), [dataA]);
  const totalsB = useMemo(() => sumTotals(dataB), [dataB]);

  const metrics: ComparedMetric[] = useMemo(() => {
    const defs: Array<[keyof MetricSet, string]> = [
      ["sessions", "Sessions"],
      ["users", "Users"],
      ["pageviews", "Pageviews"],
      ["engagement", "Engagement"],
    ];
    return defs.map(([key, label]) => ({
      key,
      label,
      ...compare(totalsA[key], totalsB[key]),
    }));
  }, [totalsA, totalsB]);

  // Aligned by position in each range, so periods of equal length line up even
  // when their calendar dates don't.
  const chartData = useMemo(() => {
    const sa = dailySeries(dataA, rangeA);
    const sb = dailySeries(dataB, rangeB);
    const len = Math.max(sa.length, sb.length);
    return Array.from({ length: len }, (_, i) => ({
      name: sa[i] ? format(parseISO(sa[i].date), "MMM dd") : `Day ${i + 1}`,
      periodB: sb[i]?.sessions ?? 0,
      periodA: sa[i]?.sessions ?? 0,
      labelA: sa[i]?.date ?? "",
      labelB: sb[i]?.date ?? "",
    }));
  }, [dataA, dataB, rangeA, rangeB]);

  const pageRows: ComparedRow[] = useMemo(() => {
    const toMap = (rows: AggregatedPageData[]) =>
      new Map(
        rows.map((r) => [
          r.pageName,
          {
            label: r.pageName,
            sublabel: r.category,
            metrics: {
              sessions: r.totals.sessions,
              users: r.totals.users,
              pageviews: r.totals.pageviews,
              engagement: r.totals.engagement_rate_avg,
            },
          },
        ]),
      );
    return buildRows(toMap(dataA), toMap(dataB));
  }, [dataA, dataB]);

  const landingRows: ComparedRow[] = useMemo(() => {
    const toMap = (rows: TopPageRow[] | undefined) =>
      new Map(
        (rows ?? []).map((r) => [
          r.page_path,
          {
            label: r.pageName || r.page_path,
            sublabel: r.team || r.section,
            metrics: {
              sessions: r.sessions,
              users: r.users,
              pageviews: r.pageviews,
              engagement: 0,
            },
          },
        ]),
      );
    return buildRows(toMap(pagesA.data), toMap(pagesB.data));
  }, [pagesA.data, pagesB.data]);

  const applyPreset = (preset: "prevPeriod" | "prevWeek" | "prevMonth") => {
    const span = Math.max(
      differenceInCalendarDays(parseISO(rangeA.end), parseISO(rangeA.start)),
      0,
    );
    if (preset === "prevPeriod") {
      const end = subDays(parseISO(rangeA.start), 1);
      setRangeB({
        start: format(subDays(end, span), "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      });
      return;
    }
    const shift = preset === "prevWeek" ? 7 : 28;
    setRangeB({
      start: format(subDays(parseISO(rangeA.start), shift), "yyyy-MM-dd"),
      end: format(subDays(parseISO(rangeA.end), shift), "yyyy-MM-dd"),
    });
  };

  return {
    rangeA,
    setRangeA,
    rangeB,
    setRangeB,
    applyPreset,
    metrics,
    chartData,
    pageRows,
    landingRows,
    totalsA,
    totalsB,
    loading:
      aggA.isFetching || aggB.isFetching || pagesA.isFetching || pagesB.isFetching,
  };
}
