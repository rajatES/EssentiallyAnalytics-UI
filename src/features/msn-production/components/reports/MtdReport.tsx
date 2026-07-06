"use client";

import { useMemo } from "react";
import type { MtdReportResult, ReportsConfig } from "../../types";
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
  data?: MtdReportResult;
  isLoading: boolean;
  isError: boolean;
  config?: ReportsConfig;
}

export default function MtdReport({ data, isLoading, isError, config }: Props) {
  const totals = useMemo(() => {
    const rows = data?.rows ?? [];
    return {
      articleViews: sumBy(rows, (r) => r.articleViews),
      slideshowViews: sumBy(rows, (r) => r.slideshowViews),
      videoViews: sumBy(rows, (r) => r.videoViews),
      consumedHours: sumBy(rows, (r) => r.videoConsumedHours),
    };
  }, [data]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.rows?.length) {
    return (
      <EmptyState message="No month-to-date data yet — it appears after the MTD scraper posts a report." />
    );
  }

  const grand =
    totals.articleViews + totals.slideshowViews + totals.videoViews;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="Total views" value={fmtInt(grand)} hint="all content types" />
        <KpiCard label="Article views" value={fmtInt(totals.articleViews)} />
        <KpiCard label="Slideshow views" value={fmtInt(totals.slideshowViews)} />
        <KpiCard label="Video views" value={fmtInt(totals.videoViews)} />
        <KpiCard label="Watch hours" value={fmtDec(totals.consumedHours)} />
      </div>

      <ReportCard
        title="Publications — month to date"
        subtitle={data.asOf ? `As of ${data.asOf}` : undefined}
      >
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <tr>
                <th className={TH_BASE}>Publication</th>
                <th className={`${TH_BASE} text-right`}>Article views</th>
                <th className={`${TH_BASE} text-right`}>Slideshow views</th>
                <th className={`${TH_BASE} text-right`}>Video views</th>
                <th className={`${TH_BASE} text-right`}>Total views</th>
                <th className={`${TH_BASE} text-right`}>Watch hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.rows.map((r) => {
                const rowTotal =
                  (r.articleViews ?? 0) +
                  (r.slideshowViews ?? 0) +
                  (r.videoViews ?? 0);
                return (
                  <tr key={r.publication} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className={TD_NAME} title={r.publication}>
                      {config?.publications?.[r.publication]?.shortName ?? r.publication}
                    </td>
                    <td className={TD_NUM}>{fmtInt(r.articleViews)}</td>
                    <td className={TD_NUM}>{fmtInt(r.slideshowViews)}</td>
                    <td className={TD_NUM}>{fmtInt(r.videoViews)}</td>
                    <td className={`${TD_NUM} font-medium text-gray-700 dark:text-gray-300`}>
                      {fmtInt(rowTotal)}
                    </td>
                    <td className={TD_NUM}>{fmtDec(r.videoConsumedHours)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className={TD_NUM}>{fmtInt(totals.articleViews)}</td>
                <td className={TD_NUM}>{fmtInt(totals.slideshowViews)}</td>
                <td className={TD_NUM}>{fmtInt(totals.videoViews)}</td>
                <td className={TD_NUM}>{fmtInt(grand)}</td>
                <td className={TD_NUM}>{fmtDec(totals.consumedHours)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ReportCard>
    </div>
  );
}
