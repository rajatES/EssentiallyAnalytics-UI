import { useQuery } from "@tanstack/react-query";
import {
  fetchMsnSyncStatus,
  fetchMsnFilters,
  fetchMsnOverview,
  fetchMsnTimeseries,
  fetchMsnWriters,
  fetchMsnEditors,
  fetchMsnProduction,
  fetchMsnStageDurations,
  fetchMsnStageBoard,
  fetchMsnPeopleAvailability,
  fetchMsnCategorySplit,
  fetchMsnInsights,
  fetchMsnModeration,
  fetchMsnDuplicates,
} from "@/lib/api";
import type {
  MsnFilterParams,
  SyncStatus,
  FilterOptions,
  KpiOverview,
  TimeseriesBucket,
  WriterStats,
  EditorStats,
  ProductionResult,
  StageDurationResult,
  StageBoardResult,
  AvailabilityResult,
  CategorySplitEntry,
  InsightsResult,
  ModerationResult,
  DuplicatesResult,
} from "../types";

function filterToParams(f: MsnFilterParams, extra?: Record<string, string>) {
  const p: Record<string, any> = {};
  if (f.startDate) p.startDate = f.startDate;
  if (f.endDate) p.endDate = f.endDate;
  if (f.categories?.length) p.categories = f.categories;
  return { ...p, ...extra };
}

const STALE = 1000 * 60 * 5;

export function useSyncStatus() {
  return useQuery<SyncStatus>({
    queryKey: ["msn-sync-status"],
    queryFn: fetchMsnSyncStatus,
    refetchInterval: 30000,
  });
}

export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ["msn-filters"],
    queryFn: fetchMsnFilters,
    staleTime: STALE,
  });
}

export function useOverview(filters: MsnFilterParams) {
  return useQuery<KpiOverview>({
    queryKey: ["msn-overview", filters],
    queryFn: () => fetchMsnOverview(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useTimeseries(filters: MsnFilterParams, granularity: string) {
  return useQuery<TimeseriesBucket[]>({
    queryKey: ["msn-timeseries", filters, granularity],
    queryFn: () => fetchMsnTimeseries(filterToParams(filters, { granularity })),
    staleTime: STALE,
  });
}

export function useWriterStats(filters: MsnFilterParams) {
  return useQuery<WriterStats[]>({
    queryKey: ["msn-writers", filters],
    queryFn: () => fetchMsnWriters(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useEditorStats(filters: MsnFilterParams) {
  return useQuery<EditorStats[]>({
    queryKey: ["msn-editors", filters],
    queryFn: () => fetchMsnEditors(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useProduction(filters: MsnFilterParams) {
  return useQuery<ProductionResult>({
    queryKey: ["msn-production", filters],
    queryFn: () => fetchMsnProduction(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useStageDurations(filters: MsnFilterParams) {
  return useQuery<StageDurationResult>({
    queryKey: ["msn-stage-durations", filters],
    queryFn: () => fetchMsnStageDurations(filterToParams(filters)),
    staleTime: STALE,
  });
}

/** Live WIP board — category filter only; refreshes every minute. */
export function useStageBoard(categories: string[]) {
  return useQuery<StageBoardResult>({
    queryKey: ["msn-stage-board", categories],
    queryFn: () =>
      fetchMsnStageBoard(categories.length ? { categories } : {}),
    refetchInterval: 60000,
  });
}

/** Roster availability — live view, refreshes every minute. */
export function usePeopleAvailability() {
  return useQuery<AvailabilityResult>({
    queryKey: ["msn-people-availability"],
    queryFn: fetchMsnPeopleAvailability,
    refetchInterval: 60000,
  });
}

export function useCategorySplit(filters: MsnFilterParams) {
  return useQuery<CategorySplitEntry[]>({
    queryKey: ["msn-category-split", filters],
    queryFn: () => fetchMsnCategorySplit(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useInsights(filters: MsnFilterParams) {
  return useQuery<InsightsResult>({
    queryKey: ["msn-insights", filters],
    queryFn: () => fetchMsnInsights(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useModeration(filters: MsnFilterParams) {
  return useQuery<ModerationResult>({
    queryKey: ["msn-moderation", filters],
    queryFn: () => fetchMsnModeration(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useDuplicates(filters: MsnFilterParams) {
  return useQuery<DuplicatesResult>({
    queryKey: ["msn-duplicates", filters],
    queryFn: () => fetchMsnDuplicates(filterToParams(filters)),
    staleTime: STALE,
  });
}
