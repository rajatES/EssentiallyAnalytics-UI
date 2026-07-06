"use client";

import { useMemo } from "react";
import type { EodReportRow, ReportsConfig } from "../../../types";
import { fmtInt } from "../../../format";
import { ReportCard } from "../shared";
import { TYPE_COLOR, shortName } from "./helpers";

interface Props {
  rows: EodReportRow[];
  config?: ReportsConfig;
}

type TypeKey = "article" | "gallery" | "video";

const TYPES: Array<{
  key: TypeKey;
  label: string;
  color: string;
  published: (r: EodReportRow) => number | null;
  target: (c: ReportsConfig | undefined, pub: string) => number | undefined;
}> = [
  {
    key: "article",
    label: "Articles",
    color: TYPE_COLOR.Article,
    published: (r) => r.publishedArticle,
    target: (c, p) => c?.publications?.[p]?.targets.article,
  },
  {
    key: "gallery",
    label: "Slideshows",
    color: TYPE_COLOR.Gallery,
    published: (r) => r.publishedGallery,
    target: (c, p) => c?.publications?.[p]?.targets.slideshow,
  },
  {
    key: "video",
    label: "Videos",
    color: TYPE_COLOR.Video,
    published: (r) => r.publishedVideo,
    target: (c, p) => c?.publications?.[p]?.targets.video,
  },
];

export default function ProductionVsTarget({ rows, config }: Props) {
  const stats = useMemo(() => {
    return TYPES.map((t) => {
      let published = 0;
      let target = 0;
      let feedsWithTarget = 0;
      let feedsOnTarget = 0;
      const behind: Array<{ pub: string; published: number; target: number }> = [];
      for (const r of rows) {
        const p = t.published(r) ?? 0;
        const tg = t.target(config, r.publication);
        published += p;
        if (tg != null && tg > 0) {
          target += tg;
          feedsWithTarget++;
          if (p >= tg) feedsOnTarget++;
          else behind.push({ pub: r.publication, published: p, target: tg });
        }
      }
      behind.sort((a, b) => a.published / a.target - b.published / b.target);
      return {
        ...t,
        published,
        target,
        feedsWithTarget,
        feedsOnTarget,
        behind,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, config]);

  return (
    <ReportCard
      title="Production vs target"
      subtitle="Unique titles published today against each feed's daily target"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => {
          const pct =
            s.target > 0 ? Math.min((s.published / s.target) * 100, 100) : 0;
          const met = s.target > 0 && s.published >= s.target;
          return (
            <div
              key={s.key}
              className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {s.feedsOnTarget}/{s.feedsWithTarget} on target
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {fmtInt(s.published)}
                </span>
                {s.target > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    / {fmtInt(s.target)} target
                  </span>
                )}
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: met ? "#10b981" : s.color,
                  }}
                />
              </div>

              {s.behind.length > 0 ? (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Behind target
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {s.behind.slice(0, 6).map((b) => (
                      <span
                        key={b.pub}
                        title={`${b.pub}: ${b.published}/${b.target}`}
                        className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                      >
                        {shortName(config, b.pub)} {b.published}/{b.target}
                      </span>
                    ))}
                    {s.behind.length > 6 && (
                      <span className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-800">
                        +{s.behind.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                s.feedsWithTarget > 0 && (
                  <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    All feeds on target ✓
                  </p>
                )
              )}
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}
