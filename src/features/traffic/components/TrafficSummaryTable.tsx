"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAggregatedData,
  fetchPageMappings,
  processAggregatedData,
} from "@/lib/api";
import {
  formatDayLabel,
  formatRangeLabel,
  getPreviousPeriod,
  monthToDateWindow,
  previousDay,
} from "@/lib/periods";
import {
  PeriodComparisonTable,
  type ComparisonGroup,
  type MetricOption,
  type PeriodComparisonRow,
} from "@/components/ui/PeriodComparisonTable";
import { getPlatform, type TrafficPlatformKey } from "@/lib/traffic-platforms";
import type { AggregatedPageData } from "@/types";

type Metric = "sessions" | "users" | "pageviews";

const METRICS: MetricOption[] = [
  { key: "sessions", label: "Sessions" },
  { key: "users", label: "Users" },
  { key: "pageviews", label: "Views" },
];

interface Props {
  platform: TrafficPlatformKey;
  startDate: string;
  endDate: string;
  campaign?: string;
  /** Current-range rows the page already loaded, reused instead of refetched. */
  data: AggregatedPageData[];
  loading?: boolean;
}

/**
 * Category-level comparison for the active platform, across three windows.
 *
 * Each extra window is a second fetch keyed exactly like the page's own range
 * query, so picking that range in the date picker hits the cache.
 */
export function TrafficSummaryTable({
  platform,
  startDate,
  endDate,
  campaign,
  data,
  loading,
}: Props) {
  const [metric, setMetric] = useState<Metric>("sessions");

  const { prevStart, prevEnd } = useMemo(
    () => getPreviousPeriod(startDate, endDate),
    [startDate, endDate],
  );

  const { data: mappings = [] } = useQuery({
    queryKey: ["mappings"],
    queryFn: fetchPageMappings,
    staleTime: 1000 * 60 * 60,
  });

  // Latest day actually present in the data rather than the range end, so a
  // reporting lag doesn't leave the day columns sitting on an empty date.
  const latestDay = useMemo(() => {
    let max = "";
    for (const row of data) {
      for (const day of row.dailyTrend) {
        if (day.date > max) max = day.date;
      }
    }
    return max || endDate;
  }, [data, endDate]);

  const prevDayStr = useMemo(() => previousDay(latestDay), [latestDay]);
  const mtd = useMemo(() => monthToDateWindow(latestDay), [latestDay]);

  const rangeQuery = (start: string, end: string) => ({
    queryKey: ["analytics-aggregated", platform, start, end, campaign ?? ""],
    queryFn: () =>
      fetchAggregatedData(start, end, platform, campaign || undefined),
    enabled: !!start && !!end,
  });

  const prevPeriod = useQuery(rangeQuery(prevStart, prevEnd));
  const mtdCurrent = useQuery(rangeQuery(mtd.start, mtd.end));
  const mtdPrevious = useQuery(rangeQuery(mtd.prevStart, mtd.prevEnd));

  const prevData = useMemo(
    () => processAggregatedData(prevPeriod.data ?? [], platform, mappings),
    [prevPeriod.data, platform, mappings],
  );
  const mtdData = useMemo(
    () => processAggregatedData(mtdCurrent.data ?? [], platform, mappings),
    [mtdCurrent.data, platform, mappings],
  );
  const mtdPrevData = useMemo(
    () => processAggregatedData(mtdPrevious.data ?? [], platform, mappings),
    [mtdPrevious.data, platform, mappings],
  );

  const rows = useMemo(() => {
    const categoryOf = (page: AggregatedPageData) => page.category || "Other";

    const sumRange = (pages: AggregatedPageData[]) => {
      const totals = new Map<string, number>();
      for (const page of pages) {
        const key = categoryOf(page);
        totals.set(key, (totals.get(key) ?? 0) + page.totals[metric]);
      }
      return totals;
    };

    // The four datasets overlap, so a single day is read from the first one
    // that covers it — summing across them would count the same day twice.
    const sumDay = (date: string) => {
      for (const pages of [data, prevData, mtdData, mtdPrevData]) {
        const totals = new Map<string, number>();
        let found = false;
        for (const page of pages) {
          for (const entry of page.dailyTrend) {
            if (entry.date !== date) continue;
            found = true;
            const key = categoryOf(page);
            totals.set(key, (totals.get(key) ?? 0) + entry[metric]);
          }
        }
        if (found) return totals;
      }
      return new Map<string, number>();
    };

    const parts = {
      range: { current: sumRange(data), previous: sumRange(prevData) },
      day: { current: sumDay(latestDay), previous: sumDay(prevDayStr) },
      mtd: { current: sumRange(mtdData), previous: sumRange(mtdPrevData) },
    };

    const labels = new Set<string>();
    for (const group of Object.values(parts)) {
      for (const side of Object.values(group)) {
        for (const key of side.keys()) labels.add(key);
      }
    }

    return Array.from(labels).map<PeriodComparisonRow>((label) => ({
      label,
      values: {
        range: {
          current: parts.range.current.get(label) ?? 0,
          previous: parts.range.previous.get(label) ?? 0,
        },
        day: {
          current: parts.day.current.get(label) ?? 0,
          previous: parts.day.previous.get(label) ?? 0,
        },
        mtd: {
          current: parts.mtd.current.get(label) ?? 0,
          previous: parts.mtd.previous.get(label) ?? 0,
        },
      },
    }));
  }, [data, prevData, mtdData, mtdPrevData, metric, latestDay, prevDayStr]);

  const groups: ComparisonGroup[] = [
    {
      key: "range",
      title: "Selected period",
      currentLabel: formatRangeLabel(startDate, endDate),
      previousLabel: formatRangeLabel(prevStart, prevEnd),
    },
    {
      key: "day",
      title: "Latest day",
      currentLabel: formatDayLabel(latestDay),
      previousLabel: formatDayLabel(prevDayStr),
    },
    {
      key: "mtd",
      title: "Month to date",
      currentLabel: formatRangeLabel(mtd.start, mtd.end),
      previousLabel: formatRangeLabel(mtd.prevStart, mtd.prevEnd),
    },
  ];

  const platformUi = getPlatform(platform);
  const metricLabel =
    METRICS.find((m) => m.key === metric)?.label ?? "Sessions";

  return (
    <PeriodComparisonTable
      rows={rows}
      groups={groups}
      rowHeader="Category"
      subtitle={`${platformUi.label} ${metricLabel.toLowerCase()} by category, each window against the one before it`}
      csvFilename={`${platformUi.shortLabel.toLowerCase()}-period-comparison`}
      loading={
        loading ||
        prevPeriod.isFetching ||
        mtdCurrent.isFetching ||
        mtdPrevious.isFetching
      }
      metricOptions={METRICS}
      activeMetric={metric}
      onMetricChange={(key) => setMetric(key as Metric)}
    />
  );
}
