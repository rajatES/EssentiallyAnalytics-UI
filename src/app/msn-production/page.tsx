"use client";

import { useState, useCallback, useMemo } from "react";
import { triggerMsnSync } from "@/lib/api";
import type { MsnFilterParams } from "@/features/msn-production/types";
import {
  useSyncStatus,
  useFilterOptions,
  useOverview,
  useTimeseries,
  useFunnel,
  useStatusMix,
  useFeedStats,
  useWriterStats,
  useEditorStats,
  useAllotterStats,
  useContentMix,
  useHeatmap,
  useWriterDaily,
  useEditorDaily,
  useLeakage,
  useRepeatingTitles,
} from "@/features/msn-production/hooks/useMsnData";

import MsnFilterBar from "@/features/msn-production/components/MsnFilterBar";
import MsnKpiStrip from "@/features/msn-production/components/MsnKpiStrip";
import ProductionFunnel from "@/features/msn-production/components/ProductionFunnel";
import ProductionTimeseries from "@/features/msn-production/components/ProductionTimeseries";
import StatusDistribution from "@/features/msn-production/components/StatusDistribution";
import FeedLeaderboard from "@/features/msn-production/components/FeedLeaderboard";
import PerformanceTable from "@/features/msn-production/components/PerformanceTable";
import ContentTypeMix from "@/features/msn-production/components/ContentTypeMix";
import ProductionHeatmap from "@/features/msn-production/components/ProductionHeatmap";
import WriterComparisonChart from "@/features/msn-production/components/WriterComparisonChart";
import EditorComparisonChart from "@/features/msn-production/components/EditorComparisonChart";
import AllotterComparisonChart from "@/features/msn-production/components/AllotterComparisonChart";
import WriterDailyBreakdown from "@/features/msn-production/components/WriterDailyBreakdown";
import EditorDailyBreakdown from "@/features/msn-production/components/EditorDailyBreakdown";
import LeakagePanel from "@/features/msn-production/components/LeakagePanel";
import RepeatingTitlesTable from "@/features/msn-production/components/RepeatingTitlesTable";
import { useRole } from "@/hooks/useRole";

function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MsnProductionPage() {
  const { canAccess } = useRole();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [tsGranularity, setTsGranularity] = useState("week");
  const [mixGranularity, setMixGranularity] = useState("week");
  const [heatmapType, setHeatmapType] = useState("feed-writer");

  const [isSyncing, setIsSyncing] = useState(false);

  const filters: MsnFilterParams = useMemo(
    () => ({
      startDate,
      endDate,
      brands: selectedBrands,
      feeds: selectedFeeds,
      contentTypes: selectedContentTypes,
      statuses: selectedStatuses,
    }),
    [startDate, endDate, selectedBrands, selectedFeeds, selectedContentTypes, selectedStatuses],
  );

  const syncStatus = useSyncStatus();
  const filterOptions = useFilterOptions();
  const overview = useOverview(filters);
  const timeseries = useTimeseries(filters, tsGranularity);
  const funnel = useFunnel(filters);
  const statusMix = useStatusMix(filters);
  const feedStats = useFeedStats(filters);
  const writerStats = useWriterStats(filters);
  const editorStats = useEditorStats(filters);
  const allotterStats = useAllotterStats(filters);
  const contentMix = useContentMix(filters, mixGranularity);
  const heatmap = useHeatmap(filters, heatmapType);
  const writerDaily = useWriterDaily(filters);
  const editorDaily = useEditorDaily(filters);
  const leakage = useLeakage(filters);
  const repeatingTitles = useRepeatingTitles(filters);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await triggerMsnSync();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedBrands([]);
    setSelectedFeeds([]);
    setSelectedContentTypes([]);
    setSelectedStatuses([]);
    setStartDate(defaultStartDate());
    setEndDate(todayDate());
  }, []);

  return (
    <div className="min-h-screen space-y-3 px-4 pb-4 pt-2 lg:px-6 lg:pb-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">MSN Production</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Content production analytics</p>
      </div>

      <MsnFilterBar
        filterOptions={filterOptions.data}
        syncStatus={syncStatus.data}
        startDate={startDate}
        endDate={endDate}
        selectedBrands={selectedBrands}
        selectedFeeds={selectedFeeds}
        selectedWriters={[]}
        selectedEditors={[]}
        selectedContentTypes={selectedContentTypes}
        selectedStatuses={selectedStatuses}
        selectedAllotters={[]}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onBrandsChange={setSelectedBrands}
        onFeedsChange={setSelectedFeeds}
        onWritersChange={() => {}}
        onEditorsChange={() => {}}
        onContentTypesChange={setSelectedContentTypes}
        onStatusesChange={setSelectedStatuses}
        onAllottersChange={() => {}}
        onReset={handleReset}
        onSync={handleSync}
        isSyncing={isSyncing}
        showSync={canAccess("admin")}
      />

      <MsnKpiStrip data={overview.data} isLoading={overview.isLoading} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ProductionFunnel data={funnel.data} isLoading={funnel.isLoading} />
        <StatusDistribution data={statusMix.data} isLoading={statusMix.isLoading} />
      </div>

      <ProductionTimeseries
        data={timeseries.data}
        isLoading={timeseries.isLoading}
        granularity={tsGranularity}
        onGranularityChange={setTsGranularity}
      />

      <ContentTypeMix
        data={contentMix.data}
        isLoading={contentMix.isLoading}
        granularity={mixGranularity}
        onGranularityChange={setMixGranularity}
      />

      <FeedLeaderboard data={feedStats.data} isLoading={feedStats.isLoading} />

      <PerformanceTable
        writerData={writerStats.data}
        editorData={editorStats.data}
        allotterData={allotterStats.data}
        isLoading={writerStats.isLoading || editorStats.isLoading || allotterStats.isLoading}
      />

      <WriterDailyBreakdown data={writerDaily.data} isLoading={writerDaily.isLoading} />

      <WriterComparisonChart data={writerStats.data} isLoading={writerStats.isLoading} />

      <EditorDailyBreakdown data={editorDaily.data} isLoading={editorDaily.isLoading} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <EditorComparisonChart data={editorStats.data} isLoading={editorStats.isLoading} />
        <AllotterComparisonChart data={allotterStats.data} isLoading={allotterStats.isLoading} />
      </div>

      <ProductionHeatmap
        data={heatmap.data}
        isLoading={heatmap.isLoading}
        type={heatmapType}
        onTypeChange={setHeatmapType}
      />

      <LeakagePanel data={leakage.data} isLoading={leakage.isLoading} />

      <RepeatingTitlesTable data={repeatingTitles.data} isLoading={repeatingTitles.isLoading} />
    </div>
  );
}
