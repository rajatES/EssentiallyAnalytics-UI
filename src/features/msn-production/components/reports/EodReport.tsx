"use client";

import { useMemo } from "react";
import type { EodReportResult, ReportsConfig } from "../../types";
import { fmtInt, fmtPct } from "../../format";
import { EmptyState, KpiCard, LoadingBlock, sumBy } from "./shared";
import { orderRows, typeTotal } from "./eod/helpers";
import ProductionVsTarget from "./eod/ProductionVsTarget";
import ViewsSection from "./eod/ViewsSection";
import FeedHealthWatch from "./eod/FeedHealthWatch";
import FeedDetailTable from "./eod/FeedDetailTable";

interface Props {
  data?: EodReportResult;
  isLoading: boolean;
  isError: boolean;
  config?: ReportsConfig;
}

export default function EodReport({ data, isLoading, isError, config }: Props) {
  const rows = useMemo(
    () => orderRows(data?.rows ?? [], config),
    [data, config],
  );

  const totals = useMemo(() => {
    const healthVals = rows
      .map((r) => r.feedHealthRate)
      .filter((v): v is number => v != null);
    const rateVals = rows
      .map((r) => r.publishRate)
      .filter((v): v is number => v != null);
    return {
      article: sumBy(rows, (r) => typeTotal(r, "Article")),
      gallery: sumBy(rows, (r) => typeTotal(r, "Gallery")),
      video: sumBy(rows, (r) => typeTotal(r, "Video")),
      published: sumBy(rows, (r) => r.publishedTotal),
      avgHealth: healthVals.length
        ? healthVals.reduce((a, b) => a + b, 0) / healthVals.length
        : null,
      avgRate: rateVals.length
        ? rateVals.reduce((a, b) => a + b, 0) / rateVals.length
        : null,
    };
  }, [rows]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.rows?.length) {
    return (
      <EmptyState message="No EOD report data yet — it appears after the daily scraper posts a report." />
    );
  }
  if (rows.length === 0) {
    return <EmptyState message="No feeds match the current filters." />;
  }

  return (
    <div className="space-y-4">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Article views" value={fmtInt(totals.article)} />
        <KpiCard label="Slideshow views" value={fmtInt(totals.gallery)} />
        <KpiCard label="Video views" value={fmtInt(totals.video)} />
        <KpiCard label="Published" value={fmtInt(totals.published)} hint="unique titles" />
        <KpiCard label="Avg feed health" value={fmtPct(totals.avgHealth)} />
        <KpiCard label="Avg publish rate" value={fmtPct(totals.avgRate)} />
      </div>

      <ProductionVsTarget rows={rows} config={config} />
      <ViewsSection rows={rows} config={config} />
      <FeedHealthWatch rows={rows} config={config} />
      <FeedDetailTable rows={rows} config={config} />
    </div>
  );
}
