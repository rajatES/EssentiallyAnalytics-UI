"use client";

import { useMemo } from "react";
import type { EowReportResult, ReportsConfig } from "../../types";
import { fmtDec, fmtInt } from "../../format";
import {
  EmptyState,
  KpiCard,
  LoadingBlock,
  ReportCard,
  TD_NAME,
  TD_NUM,
  TH_BASE,
  sumBy,
} from "./shared";

interface Props {
  data?: EowReportResult;
  isLoading: boolean;
  isError: boolean;
  config?: ReportsConfig;
}

export default function EowReport({ data, isLoading, isError, config }: Props) {
  const totals = useMemo(() => {
    const rows = data?.rows ?? [];
    return {
      articlePublished: sumBy(rows, (r) => r.articlePublished),
      articleViews: sumBy(rows, (r) => r.articleViews),
      slideshowPublished: sumBy(rows, (r) => r.slideshowPublished),
      slideshowViews: sumBy(rows, (r) => r.slideshowViews),
      videoPublished: sumBy(rows, (r) => r.videoPublished),
      videoViews: sumBy(rows, (r) => r.videoViews),
      consumedHours: sumBy(rows, (r) => r.videoConsumedHours),
    };
  }, [data]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.rows?.length) {
    return (
      <EmptyState message="No weekly report data yet — it appears after the weekly scraper posts a report." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Articles" value={fmtInt(totals.articlePublished)} hint="published" />
        <KpiCard label="Article views" value={fmtInt(totals.articleViews)} />
        <KpiCard label="Slideshows" value={fmtInt(totals.slideshowPublished)} hint="published" />
        <KpiCard label="Slideshow views" value={fmtInt(totals.slideshowViews)} />
        <KpiCard label="Videos" value={fmtInt(totals.videoPublished)} hint="published" />
        <KpiCard label="Video views" value={fmtInt(totals.videoViews)} />
        <KpiCard label="Watch hours" value={fmtDec(totals.consumedHours)} />
      </div>

      <ReportCard
        title="Publications — weekly"
        subtitle={
          data.weekEnd
            ? `Window ${data.weekStart} → ${data.weekEnd} (7 days inclusive)`
            : `Week starting ${data.weekStart}`
        }
      >
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className={TH_BASE}>Publication</th>
                <th className={`${TH_BASE} text-right`}>Articles</th>
                <th className={`${TH_BASE} text-right`}>Article views</th>
                <th className={`${TH_BASE} text-right`}>Slideshows</th>
                <th className={`${TH_BASE} text-right`}>Slideshow views</th>
                <th className={`${TH_BASE} text-right`}>Videos</th>
                <th className={`${TH_BASE} text-right`}>Video views</th>
                <th className={`${TH_BASE} text-right`}>Watch hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.rows.map((r) => (
                <tr key={r.publication} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className={TD_NAME} title={r.publication}>
                    {config?.publications?.[r.publication]?.shortName ?? r.publication}
                  </td>
                  <td className={TD_NUM}>{fmtInt(r.articlePublished)}</td>
                  <td className={TD_NUM}>{fmtInt(r.articleViews)}</td>
                  <td className={TD_NUM}>{fmtInt(r.slideshowPublished)}</td>
                  <td className={TD_NUM}>{fmtInt(r.slideshowViews)}</td>
                  <td className={TD_NUM}>{fmtInt(r.videoPublished)}</td>
                  <td className={TD_NUM}>{fmtInt(r.videoViews)}</td>
                  <td className={TD_NUM}>{fmtDec(r.videoConsumedHours)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className={TD_NUM}>{fmtInt(totals.articlePublished)}</td>
                <td className={TD_NUM}>{fmtInt(totals.articleViews)}</td>
                <td className={TD_NUM}>{fmtInt(totals.slideshowPublished)}</td>
                <td className={TD_NUM}>{fmtInt(totals.slideshowViews)}</td>
                <td className={TD_NUM}>{fmtInt(totals.videoPublished)}</td>
                <td className={TD_NUM}>{fmtInt(totals.videoViews)}</td>
                <td className={TD_NUM}>{fmtDec(totals.consumedHours)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ReportCard>
    </div>
  );
}
