import { useQuery } from "@tanstack/react-query";
import {
  fetchCfSyncStatus,
  fetchCfFilters,
  fetchCfOverview,
  fetchCfTimeseries,
  fetchCfFunnel,
  fetchCfPending,
  fetchCfWriters,
  fetchCfEditors,
  fetchCfAllotters,
  fetchCfSendBacks,
  fetchCfTat,
  fetchCfDivisions,
  fetchCfArticleTypes,
  fetchCfYahooSplit,
  fetchCfRoster,
  fetchCfInsights,
  fetchCfResourceSummary,
  fetchCfResourceBoard,
  fetchCfResourceSuggest,
  fetchCfResourceHealth,
  fetchCfResourceProfiles,
} from "@/lib/api";
import type {
  CfFilterParams,
  SyncStatus,
  FilterOptions,
  KpiOverview,
  TimeseriesBucket,
  FunnelStage,
  PendingResult,
  WriterStats,
  EditorStats,
  AllotterStats,
  SendBackResult,
  TatResult,
  DivisionStats,
  ArticleTypeEntry,
  YahooSplitResult,
  RosterResult,
  InsightsResult,
  ResourceSummaryResult,
  ResourceBoardResult,
  SuggestResult,
  ScheduleHealthResult,
  ResourceProfile,
} from "../types";

/** Only the fields the API actually filters on reach the query string. */
function toParams(f: CfFilterParams, extra?: Record<string, string>) {
  const p: Record<string, unknown> = {};
  if (f.startDate) p.startDate = f.startDate;
  if (f.endDate) p.endDate = f.endDate;
  if (f.divisions?.length) p.divisions = f.divisions;
  if (f.writers?.length) p.writers = f.writers;
  if (f.editors?.length) p.editors = f.editors;
  if (f.articleTypes?.length) p.articleTypes = f.articleTypes;
  if (f.statuses?.length) p.statuses = f.statuses;
  if (f.allotters?.length) p.allotters = f.allotters;
  if (f.yahoo) p.yahoo = f.yahoo;
  return { ...p, ...extra };
}

const STALE = 1000 * 60 * 5;

export function useCfSyncStatus() {
  return useQuery<SyncStatus>({
    queryKey: ["cf-sync-status"],
    queryFn: fetchCfSyncStatus,
    refetchInterval: 30000,
  });
}

export function useCfFilters() {
  return useQuery<FilterOptions>({
    queryKey: ["cf-filters"],
    queryFn: fetchCfFilters,
    staleTime: STALE,
  });
}

export function useCfOverview(filters: CfFilterParams) {
  return useQuery<KpiOverview>({
    queryKey: ["cf-overview", filters],
    queryFn: () => fetchCfOverview(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfTimeseries(filters: CfFilterParams, granularity: string) {
  return useQuery<TimeseriesBucket[]>({
    queryKey: ["cf-timeseries", filters, granularity],
    queryFn: () => fetchCfTimeseries(toParams(filters, { granularity })),
    staleTime: STALE,
  });
}

export function useCfFunnel(filters: CfFilterParams) {
  return useQuery<FunnelStage[]>({
    queryKey: ["cf-funnel", filters],
    queryFn: () => fetchCfFunnel(toParams(filters)),
    staleTime: STALE,
  });
}

/** The live queue board — refreshed on a timer, since it is the action view. */
export function useCfPending(filters: CfFilterParams) {
  return useQuery<PendingResult>({
    queryKey: ["cf-pending", filters],
    queryFn: () => fetchCfPending(toParams(filters)),
    refetchInterval: 60000,
  });
}

export function useCfWriters(filters: CfFilterParams) {
  return useQuery<WriterStats[]>({
    queryKey: ["cf-writers", filters],
    queryFn: () => fetchCfWriters(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfEditors(filters: CfFilterParams) {
  return useQuery<EditorStats[]>({
    queryKey: ["cf-editors", filters],
    queryFn: () => fetchCfEditors(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfAllotters(filters: CfFilterParams) {
  return useQuery<AllotterStats[]>({
    queryKey: ["cf-allotters", filters],
    queryFn: () => fetchCfAllotters(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfSendBacks(filters: CfFilterParams) {
  return useQuery<SendBackResult>({
    queryKey: ["cf-send-backs", filters],
    queryFn: () => fetchCfSendBacks(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfTat(filters: CfFilterParams) {
  return useQuery<TatResult>({
    queryKey: ["cf-tat", filters],
    queryFn: () => fetchCfTat(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfDivisions(filters: CfFilterParams) {
  return useQuery<DivisionStats[]>({
    queryKey: ["cf-divisions", filters],
    queryFn: () => fetchCfDivisions(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfArticleTypes(filters: CfFilterParams) {
  return useQuery<ArticleTypeEntry[]>({
    queryKey: ["cf-article-types", filters],
    queryFn: () => fetchCfArticleTypes(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfYahooSplit(filters: CfFilterParams) {
  return useQuery<YahooSplitResult>({
    queryKey: ["cf-yahoo-split", filters],
    queryFn: () => fetchCfYahooSplit(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfRoster(filters: CfFilterParams) {
  return useQuery<RosterResult>({
    queryKey: ["cf-roster", filters],
    queryFn: () => fetchCfRoster(toParams(filters)),
    staleTime: STALE,
  });
}

export function useCfInsights(filters: CfFilterParams) {
  return useQuery<InsightsResult>({
    queryKey: ["cf-insights", filters],
    queryFn: () => fetchCfInsights(toParams(filters)),
    staleTime: STALE,
  });
}

// ── Resources page ──

export interface ResourceBoardParams {
  date?: string;
  divisions?: string[];
  role?: string;
  statuses?: string[];
  q?: string;
}

function boardParams(p: ResourceBoardParams) {
  const out: Record<string, unknown> = {};
  if (p.date) out.date = p.date;
  if (p.divisions?.length) out.divisions = p.divisions;
  if (p.role && p.role !== "all") out.role = p.role;
  if (p.statuses?.length) out.statuses = p.statuses;
  if (p.q) out.q = p.q;
  return out;
}

/** Live views — a manager is looking for someone right now, so refresh on a timer. */
export function useCfResourceSummary(date?: string) {
  return useQuery<ResourceSummaryResult>({
    queryKey: ["cf-resource-summary", date ?? "today"],
    queryFn: () => fetchCfResourceSummary(date ? { date } : {}),
    refetchInterval: 60000,
  });
}

export function useCfResourceBoard(params: ResourceBoardParams) {
  return useQuery<ResourceBoardResult>({
    queryKey: ["cf-resource-board", params],
    queryFn: () => fetchCfResourceBoard(boardParams(params)),
    refetchInterval: 60000,
  });
}

export function useCfResourceSuggest(
  params: { division: string; role?: string; forPerson?: string; date?: string },
  enabled: boolean,
) {
  return useQuery<SuggestResult>({
    queryKey: ["cf-resource-suggest", params],
    queryFn: () => fetchCfResourceSuggest(params),
    enabled: enabled && !!params.division,
    staleTime: 30000,
  });
}

export function useCfResourceHealth() {
  return useQuery<ScheduleHealthResult>({
    queryKey: ["cf-resource-health"],
    queryFn: fetchCfResourceHealth,
    staleTime: STALE,
  });
}

export function useCfResourceProfiles(enabled: boolean) {
  return useQuery<ResourceProfile[]>({
    queryKey: ["cf-resource-profiles"],
    queryFn: fetchCfResourceProfiles,
    enabled,
  });
}
