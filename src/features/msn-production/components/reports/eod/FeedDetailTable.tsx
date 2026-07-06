"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { EodReportRow, ReportsConfig } from "../../../types";
import { fmtInt, fmtPct } from "../../../format";
import { ReportCard, TD_NUM, TH_BASE, rateTone } from "../shared";
import { CONTENT_TYPES, TYPE_LABEL, regionsFor, shortName, typeTotal } from "./helpers";

interface Props {
  rows: EodReportRow[];
  config?: ReportsConfig;
}

export default function FeedDetailTable({ rows, config }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ReportCard
      title="Feed detail"
      subtitle="Per-feed summary · click a row for the full region and per-feed-health breakdown"
    >
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <tr>
              <th className={TH_BASE}>Feed</th>
              <th className={`${TH_BASE} text-right`}>Followers</th>
              <th className={`${TH_BASE} text-right`}>Health</th>
              <th className={`${TH_BASE} text-right`}>Publish</th>
              <th className={`${TH_BASE} text-right`}>Pub A/S/V</th>
              <th className={`${TH_BASE} text-right`}>Article views</th>
              <th className={`${TH_BASE} text-right`}>Slideshow views</th>
              <th className={`${TH_BASE} text-right`}>Video views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {rows.map((row) => {
              const isOpen = expanded === row.publication;
              const regions = regionsFor(row);
              return (
                <Fragment key={row.publication}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : row.publication)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td
                      className="whitespace-nowrap px-3 py-2 font-medium text-gray-700 dark:text-gray-300"
                      title={row.publication}
                    >
                      <span className="flex items-center gap-1.5">
                        {isOpen ? (
                          <ChevronDown size={12} className="shrink-0 text-gray-400" />
                        ) : (
                          <ChevronRight size={12} className="shrink-0 text-gray-400" />
                        )}
                        {shortName(config, row.publication)}
                      </span>
                    </td>
                    <td className={TD_NUM}>{fmtInt(row.followers)}</td>
                    <td className={`px-3 py-2 text-right font-medium tabular-nums ${rateTone(row.feedHealthRate)}`}>
                      {fmtPct(row.feedHealthRate)}
                    </td>
                    <td className={`px-3 py-2 text-right font-medium tabular-nums ${rateTone(row.publishRate)}`}>
                      {fmtPct(row.publishRate)}
                    </td>
                    <td className={TD_NUM}>
                      {fmtInt(row.publishedArticle)} / {fmtInt(row.publishedGallery)} /{" "}
                      {fmtInt(row.publishedVideo)}
                    </td>
                    <td className={TD_NUM}>{fmtInt(typeTotal(row, "Article"))}</td>
                    <td className={TD_NUM}>{fmtInt(typeTotal(row, "Gallery"))}</td>
                    <td className={TD_NUM}>{fmtInt(typeTotal(row, "Video"))}</td>
                  </tr>

                  {isOpen && (
                    <tr className="bg-gray-50/60 dark:bg-gray-800/40">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                              Views by region — {row.publication}
                            </p>
                            {regions.length === 0 ? (
                              <p className="text-xs text-gray-400">No region data</p>
                            ) : (
                              <table className="w-full text-left text-xs">
                                <thead className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                  <tr>
                                    <th className="py-1 pr-3 font-medium">Region</th>
                                    {CONTENT_TYPES.map((t) => (
                                      <th key={t} className="py-1 pr-3 text-right font-medium">
                                        {TYPE_LABEL[t]}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {regions.map((region) => (
                                    <tr key={region}>
                                      <td className="py-1 pr-3 font-medium text-gray-600 dark:text-gray-300">
                                        {region}
                                      </td>
                                      {CONTENT_TYPES.map((t) => (
                                        <td
                                          key={t}
                                          className="py-1 pr-3 text-right tabular-nums text-gray-500 dark:text-gray-400"
                                        >
                                          {fmtInt(row.views?.[t]?.[region] ?? null)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>

                          <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                              Feeds
                            </p>
                            {row.feedList?.length ? (
                              <table className="w-full text-left text-xs">
                                <thead className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                  <tr>
                                    <th className="py-1 pr-3 font-medium">Region</th>
                                    <th className="py-1 pr-3 font-medium">Type</th>
                                    <th className="py-1 pr-3 text-right font-medium">Reliability</th>
                                    <th className="py-1 pr-3 text-right font-medium">Publish rate</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {row.feedList.map((f, i) => (
                                    <tr key={`${f.region}-${f.type}-${i}`}>
                                      <td className="py-1 pr-3 font-medium text-gray-600 dark:text-gray-300">
                                        {f.region}
                                      </td>
                                      <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">
                                        {f.type}
                                      </td>
                                      <td className="py-1 pr-3 text-right tabular-nums text-gray-500 dark:text-gray-400">
                                        {f.reliability || "—"}
                                      </td>
                                      <td className="py-1 pr-3 text-right tabular-nums text-gray-500 dark:text-gray-400">
                                        {f.publishRate || "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs text-gray-400">No feed data</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
}
