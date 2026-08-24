"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReportSportsMappings } from "@/lib/api";
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

interface PerPageMetric {
  profileId: string;
  pageName: string;
  impressions: number;
  engagements: number;
  pageViews: number;
  videoViews: number;
}

type Metric = "impressions" | "engagements" | "videoViews" | "pageViews";

const METRICS: MetricOption[] = [
  { key: "impressions", label: "Impressions" },
  { key: "engagements", label: "Engagements" },
  { key: "videoViews", label: "Video Views" },
  { key: "pageViews", label: "Page Views" },
];

const fetchPerPageData = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}) => {
  const [, profileIds, startDate, endDate] = queryKey as [
    string,
    string[],
    string,
    string,
  ];
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const res = await fetch(`${BACKEND_URL}/api/analytics/aggregate/per-page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ profileIds, startDate, endDate }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Failed to fetch per-page metrics");
  return data as { pages: PerPageMetric[] };
};

interface Props {
  selectedProfileIds: string[];
  startDate: string;
  endDate: string;
  /** Overview daily series — only read to find the latest day that has data. */
  timeSeries?: Array<Record<string, unknown>>;
}

/**
 * Sport-level period comparison for the selected profiles.
 *
 * The per-page endpoint only ever returns range totals, so the day columns are
 * two extra single-day calls rather than a slice of a daily series.
 */
export default function PeriodSummaryTable({
  selectedProfileIds,
  startDate,
  endDate,
  timeSeries,
}: Props) {
  const [metric, setMetric] = useState<Metric>("impressions");

  const { prevStart, prevEnd } = useMemo(
    () => getPreviousPeriod(startDate, endDate),
    [startDate, endDate],
  );

  // The overview series zero-fills every date in the range, so the last entry
  // is usually today with nothing synced yet — walk back to a day with data.
  const latestDay = useMemo(() => {
    if (!timeSeries?.length) return endDate;
    for (let i = timeSeries.length - 1; i >= 0; i--) {
      const day = timeSeries[i];
      const hasData = METRICS.some((m) => Number(day[m.key]) > 0);
      if (hasData) return String(day.date).slice(0, 10);
    }
    return endDate;
  }, [timeSeries, endDate]);

  const prevDayStr = useMemo(() => previousDay(latestDay), [latestDay]);

  const enabled = selectedProfileIds.length > 0;

  const currentPeriod = useQuery({
    queryKey: ["per-page-aggregate", selectedProfileIds, startDate, endDate],
    queryFn: fetchPerPageData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const previousPeriod = useQuery({
    queryKey: ["per-page-aggregate", selectedProfileIds, prevStart, prevEnd],
    queryFn: fetchPerPageData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const currentDay = useQuery({
    queryKey: ["per-page-aggregate", selectedProfileIds, latestDay, latestDay],
    queryFn: fetchPerPageData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const previousDayData = useQuery({
    queryKey: ["per-page-aggregate", selectedProfileIds, prevDayStr, prevDayStr],
    queryFn: fetchPerPageData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const { data: mappings = [] } = useQuery({
    queryKey: ["report-sports-mappings"],
    queryFn: fetchReportSportsMappings,
    staleTime: 1000 * 60 * 5,
  });

  const sportByProfile = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of mappings) {
      if (m.sport) map[m.profileId] = m.sport;
    }
    return map;
  }, [mappings]);

  const rows = useMemo(() => {
    const bySport = new Map<string, PeriodComparisonRow>();
    const bucket = (profileId: string) => {
      const key = sportByProfile[profileId] || "Uncategorized";
      let row = bySport.get(key);
      if (!row) {
        row = {
          label: key,
          periodCurrent: 0,
          periodPrevious: 0,
          dayCurrent: 0,
          dayPrevious: 0,
        };
        bySport.set(key, row);
      }
      return row;
    };

    const add = (
      pages: PerPageMetric[] | undefined,
      field: keyof PeriodComparisonRow,
    ) => {
      for (const page of pages ?? []) {
        const row = bucket(page.profileId);
        (row[field] as number) += Number(page[metric]) || 0;
      }
    };

    add(currentPeriod.data?.pages, "periodCurrent");
    add(previousPeriod.data?.pages, "periodPrevious");
    add(currentDay.data?.pages, "dayCurrent");
    add(previousDayData.data?.pages, "dayPrevious");

    // Profiles with no activity in any window would otherwise show as all-zero
    // rows padding the table — the endpoint returns a row per requested profile.
    return Array.from(bySport.values()).filter(
      (r) =>
        r.periodCurrent > 0 ||
        r.periodPrevious > 0 ||
        r.dayCurrent > 0 ||
        r.dayPrevious > 0,
    );
  }, [
    currentPeriod.data,
    previousPeriod.data,
    currentDay.data,
    previousDayData.data,
    sportByProfile,
    metric,
  ]);

  const metricLabel =
    METRICS.find((m) => m.key === metric)?.label ?? "Impressions";

  return (
    <PeriodComparisonTable
      rows={rows}
      rowHeader="Sport"
      periodLabel={formatRangeLabel(startDate, endDate)}
      prevPeriodLabel={formatRangeLabel(prevStart, prevEnd)}
      dayLabel={formatDayLabel(latestDay)}
      prevDayLabel={formatDayLabel(prevDayStr)}
      subtitle={`${metricLabel} by sport — this range vs the range before it`}
      csvFilename="reports-period-comparison"
      loading={
        currentPeriod.isLoading ||
        previousPeriod.isLoading ||
        currentDay.isLoading ||
        previousDayData.isLoading
      }
      metricOptions={METRICS}
      activeMetric={metric}
      onMetricChange={(key) => setMetric(key as Metric)}
    />
  );
}
