"use client";

import { useState, useCallback, useMemo } from "react";
import { triggerMsnSync } from "@/lib/api";
import type { MsnFilterParams } from "@/features/msn-production/types";
import {
  useSyncStatus,
  useFilterOptions,
  useOverview,
  useTimeseries,
  useWriterStats,
  useEditorStats,
  useProduction,
  useStageDurations,
  useStageBoard,
  usePeopleAvailability,
  useCategorySplit,
  useInsights,
  useModeration,
  useDuplicates,
} from "@/features/msn-production/hooks/useMsnData";

import MsnHeader, {
  type MsnTab,
  type RangeKey,
} from "@/features/msn-production/components/MsnHeader";
import KpiHero from "@/features/msn-production/components/KpiHero";
import ProductionSummary from "@/features/msn-production/components/ProductionSummary";
import AllotmentTable from "@/features/msn-production/components/AllotmentTable";
import DraftDeltaTable from "@/features/msn-production/components/DraftDeltaTable";
import EditedTable from "@/features/msn-production/components/EditedTable";
import StageBoard from "@/features/msn-production/components/StageBoard";
import ThroughputChart from "@/features/msn-production/components/ThroughputChart";
import CategorySplit from "@/features/msn-production/components/CategorySplit";
import StageDurationCards from "@/features/msn-production/components/StageDurationCards";
import SlowestPieces from "@/features/msn-production/components/SlowestPieces";
import FeedDurations from "@/features/msn-production/components/FeedDurations";
import DivisionBandwidth from "@/features/msn-production/components/DivisionBandwidth";
import AvailabilityBoard from "@/features/msn-production/components/AvailabilityBoard";
import WorkloadTable from "@/features/msn-production/components/WorkloadTable";
import WritersTable from "@/features/msn-production/components/WritersTable";
import EditorsTable from "@/features/msn-production/components/EditorsTable";
import ContentTypeCards from "@/features/msn-production/components/ContentTypeCards";
import WeekdayRhythm from "@/features/msn-production/components/WeekdayRhythm";
import PublishHeatmap from "@/features/msn-production/components/PublishHeatmap";
import DropAnalysisCard from "@/features/msn-production/components/DropAnalysisCard";
import WriterQuadrant from "@/features/msn-production/components/WriterQuadrant";
import PairMatrix from "@/features/msn-production/components/PairMatrix";
import MomentumBoard from "@/features/msn-production/components/MomentumBoard";
import DivisionLoad from "@/features/msn-production/components/DivisionLoad";
import ModerationSummary from "@/features/msn-production/components/ModerationSummary";
import UnmoderatedTable from "@/features/msn-production/components/UnmoderatedTable";
import ModerationTimeline from "@/features/msn-production/components/ModerationTimeline";
import ModeratorActivity from "@/features/msn-production/components/ModeratorActivity";
import RecheckedTitles from "@/features/msn-production/components/RecheckedTitles";
import FailDimensions from "@/features/msn-production/components/FailDimensions";
import ModerationOverviewCard from "@/features/msn-production/components/ModerationOverviewCard";
import DuplicatesOverviewCard from "@/features/msn-production/components/DuplicatesOverviewCard";
import DuplicateTitlesTable from "@/features/msn-production/components/DuplicateTitlesTable";
import ReportsView from "@/features/msn-production/components/reports/ReportsView";
import { useRole } from "@/hooks/useRole";

const RANGE_DAYS: Record<Exclude<RangeKey, "custom">, number | null> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
  all: null,
};

export default function MsnProductionPage() {
  const { canAccess } = useRole();

  const [tab, setTab] = useState<MsnTab>("overview");
  const [range, setRange] = useState<RangeKey>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tsGranularity, setTsGranularity] = useState("day");
  const [isSyncing, setIsSyncing] = useState(false);

  const filters: MsnFilterParams = useMemo(() => {
    if (range === "custom") {
      if (customStart && customEnd) {
        return { startDate: customStart, endDate: customEnd, categories: selectedCategories };
      }
      return { categories: selectedCategories };
    }
    const days = RANGE_DAYS[range];
    if (days === null) {
      return { categories: selectedCategories };
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      categories: selectedCategories,
    };
  }, [range, selectedCategories, customStart, customEnd]);

  const syncStatus = useSyncStatus();
  const filterOptions = useFilterOptions();

  // Overview
  const overview = useOverview(filters);
  const stageBoard = useStageBoard(selectedCategories);
  const timeseries = useTimeseries(filters, tsGranularity);
  const categorySplit = useCategorySplit(filters);

  // Production
  const production = useProduction(filters);

  // Stages
  const stageDurations = useStageDurations(filters);

  // People
  const writerStats = useWriterStats(filters);
  const editorStats = useEditorStats(filters);
  const availability = usePeopleAvailability();

  // Insights
  const insights = useInsights(filters);

  // Moderation
  const moderation = useModeration(filters);

  // Duplicate allotments
  const duplicates = useDuplicates(filters);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await triggerMsnSync();
      await Promise.all([syncStatus.refetch()]);
    } finally {
      setIsSyncing(false);
    }
  }, [syncStatus]);

  const toggleCategory = useCallback((c: string) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleCustomRange = useCallback((start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
  }, []);

  return (
    <div className="min-h-screen space-y-4 px-4 pb-6 pt-4 lg:px-6">
      <MsnHeader
        tab={tab}
        onTab={setTab}
        range={range}
        onRange={setRange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomRange={handleCustomRange}
        categories={filterOptions.data?.categories ?? []}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        syncStatus={syncStatus.data}
        onSync={handleSync}
        isSyncing={isSyncing}
        showSync={canAccess("admin")}
      />

      {/* ── Overview: the whole operation at a glance ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <KpiHero
            overview={overview.data}
            board={stageBoard.data}
            isLoading={overview.isLoading}
          />
          <StageBoard data={stageBoard.data} isLoading={stageBoard.isLoading} />
          <ModerationOverviewCard
            data={moderation.data}
            isLoading={moderation.isLoading}
            onViewAll={() => setTab("moderation")}
          />
          <DuplicatesOverviewCard
            data={duplicates.data}
            isLoading={duplicates.isLoading}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <ThroughputChart
                data={timeseries.data}
                isLoading={timeseries.isLoading}
                granularity={tsGranularity}
                onGranularityChange={setTsGranularity}
              />
            </div>
            <div className="xl:col-span-2">
              <CategorySplit
                data={categorySplit.data}
                isLoading={categorySplit.isLoading}
              />
            </div>
          </div>
          <DuplicateTitlesTable
            data={duplicates.data}
            isLoading={duplicates.isLoading}
          />
        </div>
      )}

      {/* ── Production: allotted vs drafted vs edited scoreboard ── */}
      {tab === "production" && (
        <div className="space-y-4">
          <ProductionSummary
            data={production.data}
            isLoading={production.isLoading}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AllotmentTable
              data={production.data}
              isLoading={production.isLoading}
            />
            <EditedTable
              data={production.data}
              isLoading={production.isLoading}
            />
          </div>
          <DraftDeltaTable
            data={production.data}
            isLoading={production.isLoading}
          />
        </div>
      )}

      {/* ── Stages: how fast work moves through the pipeline ── */}
      {tab === "stages" && (
        <div className="space-y-4">
          <StageDurationCards
            data={stageDurations.data}
            isLoading={stageDurations.isLoading}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SlowestPieces
              data={stageBoard.data}
              isLoading={stageBoard.isLoading}
            />
            <FeedDurations
              data={stageDurations.data}
              isLoading={stageDurations.isLoading}
            />
          </div>
        </div>
      )}

      {/* ── People: performance + availability ── */}
      {tab === "people" && (
        <div className="space-y-4">
          <DivisionBandwidth
            data={availability.data}
            isLoading={availability.isLoading}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AvailabilityBoard
              data={availability.data}
              isLoading={availability.isLoading}
            />
            <WorkloadTable
              data={availability.data}
              isLoading={availability.isLoading}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <WritersTable
              writers={writerStats.data}
              durations={stageDurations.data}
              isLoading={writerStats.isLoading}
            />
            <EditorsTable
              editors={editorStats.data}
              isLoading={editorStats.isLoading}
            />
          </div>
        </div>
      )}

      {/* ── Insights: decision support for content + personnel ── */}
      {tab === "insights" && (
        <div className="space-y-4">
          <ContentTypeCards data={insights.data} isLoading={insights.isLoading} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <WeekdayRhythm data={insights.data} isLoading={insights.isLoading} />
            <PublishHeatmap data={insights.data} isLoading={insights.isLoading} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DropAnalysisCard data={insights.data} isLoading={insights.isLoading} />
            <DivisionLoad data={insights.data} isLoading={insights.isLoading} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <WriterQuadrant data={insights.data} isLoading={insights.isLoading} />
            </div>
            <div className="xl:col-span-2">
              <MomentumBoard data={insights.data} isLoading={insights.isLoading} />
            </div>
          </div>
          <PairMatrix data={insights.data} isLoading={insights.isLoading} />
        </div>
      )}

      {/* ── Moderation: coverage of the external moderation tool ── */}
      {tab === "moderation" && (
        <div className="space-y-4">
          <ModerationSummary
            data={moderation.data}
            isLoading={moderation.isLoading}
          />
          <UnmoderatedTable
            data={moderation.data}
            isLoading={moderation.isLoading}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ModerationTimeline
              data={moderation.data}
              isLoading={moderation.isLoading}
            />
            <ModeratorActivity
              data={moderation.data}
              isLoading={moderation.isLoading}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RecheckedTitles
              data={moderation.data}
              isLoading={moderation.isLoading}
            />
            <FailDimensions
              data={moderation.data}
              isLoading={moderation.isLoading}
            />
          </div>
        </div>
      )}

      {/* ── Reports: syndication numbers from the MSN Partner Hub scraper ── */}
      {tab === "reports" && <ReportsView />}
    </div>
  );
}
