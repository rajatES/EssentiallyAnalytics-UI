import { useQuery } from "@tanstack/react-query";
import {
  fetchMsnSyncStatus,
  fetchMsnFilters,
  fetchMsnOverview,
  fetchMsnTimeseries,
  fetchMsnFunnel,
  fetchMsnStatusMix,
  fetchMsnFeeds,
  fetchMsnWriters,
  fetchMsnEditors,
  fetchMsnAllotters,
  fetchMsnContentMix,
  fetchMsnHeatmap,
  fetchMsnWriterDaily,
  fetchMsnEditorDaily,
  fetchMsnLeakage,
  fetchMsnRepeatingTitles,
} from "@/lib/api";
import type { MsnFilterParams } from "../types";

function filterToParams(f: MsnFilterParams, extra?: Record<string, string>) {
  const p: Record<string, any> = {
    startDate: f.startDate,
    endDate: f.endDate,
  };
  if (f.brands?.length) p.brands = f.brands;
  if (f.feeds?.length) p.feeds = f.feeds;
  if (f.writers?.length) p.writers = f.writers;
  if (f.editors?.length) p.editors = f.editors;
  if (f.contentTypes?.length) p.contentTypes = f.contentTypes;
  if (f.statuses?.length) p.statuses = f.statuses;
  if (f.allotters?.length) p.allotters = f.allotters;
  return { ...p, ...extra };
}

const STALE = 1000 * 60 * 5;

export function useSyncStatus() {
  return useQuery({
    queryKey: ["msn-sync-status"],
    queryFn: fetchMsnSyncStatus,
    refetchInterval: 30000,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["msn-filters"],
    queryFn: fetchMsnFilters,
    staleTime: STALE,
  });
}

export function useOverview(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-overview", filters],
    queryFn: () => fetchMsnOverview(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useTimeseries(filters: MsnFilterParams, granularity: string) {
  return useQuery({
    queryKey: ["msn-timeseries", filters, granularity],
    queryFn: () => fetchMsnTimeseries(filterToParams(filters, { granularity })),
    staleTime: STALE,
  });
}

export function useFunnel(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-funnel", filters],
    queryFn: () => fetchMsnFunnel(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useStatusMix(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-status-mix", filters],
    queryFn: () => fetchMsnStatusMix(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useFeedStats(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-feeds", filters],
    queryFn: () => fetchMsnFeeds(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useWriterStats(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-writers", filters],
    queryFn: () => fetchMsnWriters(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useEditorStats(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-editors", filters],
    queryFn: () => fetchMsnEditors(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useAllotterStats(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-allotters", filters],
    queryFn: () => fetchMsnAllotters(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useContentMix(filters: MsnFilterParams, granularity: string) {
  return useQuery({
    queryKey: ["msn-content-mix", filters, granularity],
    queryFn: () => fetchMsnContentMix(filterToParams(filters, { granularity })),
    staleTime: STALE,
  });
}

export function useHeatmap(filters: MsnFilterParams, type: string) {
  return useQuery({
    queryKey: ["msn-heatmap", filters, type],
    queryFn: () => fetchMsnHeatmap(filterToParams(filters, { type })),
    staleTime: STALE,
  });
}

export function useWriterDaily(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-writer-daily", filters],
    queryFn: () => fetchMsnWriterDaily(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useEditorDaily(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-editor-daily", filters],
    queryFn: () => fetchMsnEditorDaily(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useLeakage(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-leakage", filters],
    queryFn: () => fetchMsnLeakage(filterToParams(filters)),
    staleTime: STALE,
  });
}

export function useRepeatingTitles(filters: MsnFilterParams) {
  return useQuery({
    queryKey: ["msn-repeating-titles", filters],
    queryFn: () => fetchMsnRepeatingTitles(filterToParams(filters)),
    staleTime: STALE,
  });
}
