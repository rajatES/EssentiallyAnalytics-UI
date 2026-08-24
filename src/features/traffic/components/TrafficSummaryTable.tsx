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
  previousDay,
} from "@/lib/periods";
import {
  PeriodComparisonTable,
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
 * Category-level period comparison for the active platform.
 *
 * The previous range comes from a second fetch keyed exactly like the page's own
 * range query, so switching the date picker to that range hits the cache.
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

  const { data: prevRaw = [], isFetching } = useQuery({
    queryKey: [
      "analytics-aggregated",
      platform,
      prevStart,
      prevEnd,
      campaign ?? "",
    ],
    queryFn: () =>
      fetchAggregatedData(prevStart, prevEnd, platform, campaign || undefined),
    enabled: !!prevStart && !!prevEnd,
  });

  const prevData = useMemo(
    () => processAggregatedData(prevRaw, platform, mappings),
    [prevRaw, platform, mappings],
  );

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

  const rows = useMemo(() => {
    const byCategory = new Map<string, PeriodComparisonRow>();
    const bucket = (category: string) => {
      const key = category || "Other";
      let row = byCategory.get(key);
      if (!row) {
        row = {
          label: key,
          periodCurrent: 0,
          periodPrevious: 0,
          dayCurrent: 0,
          dayPrevious: 0,
        };
        byCategory.set(key, row);
      }
      return row;
    };

    for (const page of data) {
      const row = bucket(page.category);
      row.periodCurrent += page.totals[metric];
      for (const day of page.dailyTrend) {
        if (day.date === latestDay) row.dayCurrent += day[metric];
        else if (day.date === prevDayStr) row.dayPrevious += day[metric];
      }
    }

    // The day before the latest one falls in the previous range whenever a
    // single day is selected, so both datasets have to be scanned for it.
    for (const page of prevData) {
      const row = bucket(page.category);
      row.periodPrevious += page.totals[metric];
      for (const day of page.dailyTrend) {
        if (day.date === prevDayStr) row.dayPrevious += day[metric];
      }
    }

    return Array.from(byCategory.values());
  }, [data, prevData, metric, latestDay, prevDayStr]);

  const platformUi = getPlatform(platform);
  const metricLabel =
    METRICS.find((m) => m.key === metric)?.label ?? "Sessions";

  return (
    <PeriodComparisonTable
      rows={rows}
      rowHeader="Category"
      periodLabel={formatRangeLabel(startDate, endDate)}
      prevPeriodLabel={formatRangeLabel(prevStart, prevEnd)}
      dayLabel={formatDayLabel(latestDay)}
      prevDayLabel={formatDayLabel(prevDayStr)}
      subtitle={`${platformUi.label} ${metricLabel.toLowerCase()} by category — this range vs the range before it`}
      csvFilename={`${platformUi.shortLabel.toLowerCase()}-period-comparison`}
      loading={loading || isFetching}
      metricOptions={METRICS}
      activeMetric={metric}
      onMetricChange={(key) => setMetric(key as Metric)}
    />
  );
}
