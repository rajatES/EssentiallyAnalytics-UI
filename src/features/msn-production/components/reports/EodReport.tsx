"use client";

import { useMemo } from "react";
import type { EodReportResult, ReportsConfig } from "../../types";
import { fmtInt, fmtPct } from "../../format";
import { EmptyState, KpiCard, LoadingBlock, sumBy } from "./shared";
import {
  DEFAULT_REGION_TIERS,
  orderRows,
  regionTierHint,
  typeTotal,
} from "./eod/helpers";
import ProductionVsTarget from "./eod/ProductionVsTarget";
import ViewsSection from "./eod/ViewsSection";
import FeedHealthWatch from "./eod/FeedHealthWatch";
import FeedDetailTable from "./eod/FeedDetailTable";

interface Props {
  data?: EodReportResult;
  isLoading: boolean;
  isError: boolean;
  config?: ReportsConfig;
  /** Selected region tier (views-only filter), or null for all regions. */
  regionTier?: string | null;
  /** Human summary of the active feed scope, e.g. "All feeds". */
  feedScopeLabel?: string;
}

export default function EodReport({
  data,
  isLoading,
  isError,
  config,
  regionTier,
  feedScopeLabel = "All feeds",
}: Props) {
  const rows = useMemo(
    () => orderRows(data?.rows ?? [], config),
    [data, config],
  );

  // Region-tier filter: restrict VIEW counts to a group of countries. Null =
  // every region. Published / targets / health are region-independent and
  // never use this.
  const regionTiers = config?.regionTiers ?? DEFAULT_REGION_TIERS;
  const regions = regionTier ? (regionTiers[regionTier] ?? null) : null;

  const totals = useMemo(() => {
    const healthVals = rows
      .map((r) => r.feedHealthRate)
      .filter((v): v is number => v != null);
    const rateVals = rows
      .map((r) => r.publishRate)
      .filter((v): v is number => v != null);
    return {
      article: sumBy(rows, (r) => typeTotal(r, "Article", regions)),
      gallery: sumBy(rows, (r) => typeTotal(r, "Gallery", regions)),
      video: sumBy(rows, (r) => typeTotal(r, "Video", regions)),
      published: sumBy(rows, (r) => r.publishedTotal),
      avgHealth: healthVals.length
        ? healthVals.reduce((a, b) => a + b, 0) / healthVals.length
        : null,
      avgRate: rateVals.length
        ? rateVals.reduce((a, b) => a + b, 0) / rateVals.length
        : null,
    };
  }, [rows, regions]);

  const regionScope = regionTier
    ? `Region ${regionTier} (${regionTierHint(regions ?? [])})`
    : "All regions";

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.rows?.length) {
    return (
      <EmptyState message="No EOD report data yet — it appears after the daily scraper posts a report." />
    );
  }
  if (rows.length === 0) {
    return <EmptyState message="No feeds match the current filters." />;
  }

  const viewsHint = regionTier ? `${regionTier} regions` : undefined;

  return (
    <div className="space-y-4">
      {/* Active scope: which region tier + feed set the numbers reflect. */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Scope:{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {regionScope}
        </span>{" "}
        ·{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {feedScopeLabel}
        </span>
      </p>

      {/* Headline KPIs — views follow the region tier; the rest are region-independent. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Article views" value={fmtInt(totals.article)} hint={viewsHint} />
        <KpiCard label="Slideshow views" value={fmtInt(totals.gallery)} hint={viewsHint} />
        <KpiCard label="Video views" value={fmtInt(totals.video)} hint={viewsHint} />
        <KpiCard label="Published" value={fmtInt(totals.published)} hint="unique titles" />
        <KpiCard label="Avg feed health" value={fmtPct(totals.avgHealth)} />
        <KpiCard label="Avg publish rate" value={fmtPct(totals.avgRate)} />
      </div>

      <ProductionVsTarget rows={rows} config={config} />
      <ViewsSection rows={rows} config={config} regionTier={regionTier} />
      <FeedHealthWatch rows={rows} config={config} />
      <FeedDetailTable rows={rows} config={config} regions={regions} />
    </div>
  );
}
