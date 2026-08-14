import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfToday, differenceInCalendarDays } from "date-fns";
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

export interface ComparedMetric {
  label: string;
  a: number;
  b: number;
  delta: number;
  pct: number | null;
}

export interface ComparedRow {
  key: string;
  label: string;
  sublabel?: string;
  a: number;
  b: number;
  delta: number;
  pct: number | null;
}

/** null pct = "no baseline", which the UI renders as "new" rather than +100%. */
function pctChange(a: number, b: number): number | null {
  if (!b) return a ? null : 0;
  return ((a - b) / b) * 100;
}

function sumTotals(
  rows: AggregatedPageData[],
  key: "sessions" | "users" | "pageviews",
): number {
  return rows.reduce((acc, r) => acc + r.totals[key], 0);
}

function toRows(
  current: Map<string, { label: string; sublabel?: string; value: number }>,
  previous: Map<string, { label: string; sublabel?: string; value: number }>,
): ComparedRow[] {
  const keys = new Set([...current.keys(), ...previous.keys()]);
  return Array.from(keys)
    .map((key) => {
      const c = current.get(key);
      const p = previous.get(key);
      const a = c?.value ?? 0;
      const b = p?.value ?? 0;
      return {
        key,
        label: c?.label ?? p?.label ?? key,
        sublabel: c?.sublabel ?? p?.sublabel,
        a,
        b,
        delta: a - b,
        pct: pctChange(a, b),
      };
    })
    .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b));
}

/**
 * Two independent date ranges fetched side by side.
 *
 * Deliberately reuses the existing endpoints rather than adding a compare API —
 * a comparison is just two reads and a subtraction, and keeping it client-side
 * means the Compare tab can never drift from what the main tab reports.
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

  const metrics: ComparedMetric[] = useMemo(() => {
    const defs: Array<[string, "sessions" | "users" | "pageviews"]> = [
      ["Sessions", "sessions"],
      ["Users", "users"],
      ["Pageviews", "pageviews"],
    ];
    return defs.map(([label, k]) => {
      const a = sumTotals(dataA, k);
      const b = sumTotals(dataB, k);
      return { label, a, b, delta: a - b, pct: pctChange(a, b) };
    });
  }, [dataA, dataB]);

  const pageRows: ComparedRow[] = useMemo(() => {
    const toMap = (rows: AggregatedPageData[]) =>
      new Map(
        rows.map((r) => [
          r.pageName,
          { label: r.pageName, sublabel: r.category, value: r.totals.sessions },
        ]),
      );
    return toRows(toMap(dataA), toMap(dataB));
  }, [dataA, dataB]);

  const landingRows: ComparedRow[] = useMemo(() => {
    const toMap = (rows: TopPageRow[] | undefined) =>
      new Map(
        (rows ?? []).map((r) => [
          r.page_path,
          {
            label: r.pageName || r.page_path,
            sublabel: r.team || r.section,
            value: r.sessions,
          },
        ]),
      );
    return toRows(toMap(pagesA.data), toMap(pagesB.data));
  }, [pagesA.data, pagesB.data]);

  const applyPreset = (preset: "prevPeriod" | "prevWeek" | "prevMonth") => {
    const span = Math.max(differenceInCalendarDays(new Date(rangeA.end), new Date(rangeA.start)), 0);
    if (preset === "prevPeriod") {
      const end = subDays(new Date(rangeA.start), 1);
      setRangeB({ start: format(subDays(end, span), "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") });
    } else if (preset === "prevWeek") {
      setRangeB({
        start: format(subDays(new Date(rangeA.start), 7), "yyyy-MM-dd"),
        end: format(subDays(new Date(rangeA.end), 7), "yyyy-MM-dd"),
      });
    } else {
      setRangeB({
        start: format(subDays(new Date(rangeA.start), 28), "yyyy-MM-dd"),
        end: format(subDays(new Date(rangeA.end), 28), "yyyy-MM-dd"),
      });
    }
  };

  return {
    rangeA,
    setRangeA,
    rangeB,
    setRangeB,
    applyPreset,
    metrics,
    pageRows,
    landingRows,
    loading:
      aggA.isFetching || aggB.isFetching || pagesA.isFetching || pagesB.isFetching,
  };
}
