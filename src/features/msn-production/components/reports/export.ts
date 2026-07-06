// CSV exporters that reproduce each report's original Google-Sheet layout, so a
// downloaded file drops straight into the corresponding tab. One exporter per
// sheet: "MSN EOD 2026", "MSN Feeds Daily", "MSN EOW", "MSN MTD".

import type {
  EodReportResult,
  EowReportResult,
  MtdReportResult,
  ReportsConfig,
} from "../../types";
import {
  CONTENT_TYPES,
  DEFAULT_REGION_TIERS,
  tierViews,
  shortName,
} from "./eod/helpers";

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}

export function downloadCsv(filename: string, rows: unknown[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const num = (v: number | null | undefined) => (v == null ? "" : v);

/** "MSN EOD 2026": Date, Feed, Followers, Health, Publish, then per-type
 *  #, Target, and tier view columns (T1/T2/T3). */
export function exportEod(
  data: EodReportResult,
  config: ReportsConfig | undefined,
): void {
  const tiers = config?.regionTiers ?? DEFAULT_REGION_TIERS;
  const tierKeys = Object.keys(tiers);
  const TYPE_META = [
    { type: "Article" as const, label: "AR", target: "article" as const, pub: "publishedArticle" as const },
    { type: "Gallery" as const, label: "SS", target: "slideshow" as const, pub: "publishedGallery" as const },
    { type: "Video" as const, label: "VDO", target: "video" as const, pub: "publishedVideo" as const },
  ];

  const header: string[] = [
    "Date",
    "Feed Name",
    "Followers",
    "Health Rate",
    "Publish Rate",
  ];
  for (const m of TYPE_META) {
    header.push(`${m.label} #`, `${m.label} Target`);
    for (const tk of tierKeys) header.push(`${m.label} Views - ${tk}`);
  }

  const rows: unknown[][] = [header];
  for (const r of data.rows) {
    const cfg = config?.publications?.[r.publication];
    const line: unknown[] = [
      data.date,
      shortName(config, r.publication),
      num(r.followers),
      num(r.feedHealthRate),
      num(r.publishRate),
    ];
    for (const m of TYPE_META) {
      line.push(num(r[m.pub]));
      line.push(cfg ? cfg.targets[m.target] : "");
      for (const tk of tierKeys) line.push(num(tierViews(r, m.type, tiers[tk])));
    }
    rows.push(line);
  }
  downloadCsv(`MSN_EOD_${data.date}.csv`, rows);
}

/** "MSN Feeds Daily": Date, Publication, Region, Type, Reliability, Publish rate. */
export function exportFeedsDaily(data: EodReportResult): void {
  const rows: unknown[][] = [
    ["Date", "Publication", "Region", "Type", "Reliability", "Publish rate"],
  ];
  for (const r of data.rows) {
    for (const f of r.feedList ?? []) {
      rows.push([data.date, r.publication, f.region, f.type, f.reliability, f.publishRate]);
    }
  }
  downloadCsv(`MSN_Feeds_Daily_${data.date}.csv`, rows);
}

/** "MSN EOW": Date, Feed, Article Published, Target, Article Views, … per type. */
export function exportEow(
  data: EowReportResult,
  config: ReportsConfig | undefined,
): void {
  const header = [
    "Date",
    "Feed Name",
    "Article Published",
    "Target Article Production",
    "Article Views",
    "Slideshows Published",
    "Target Slideshow Production",
    "Slideshow Views",
    "Videos Created",
    "Target Video Production",
    "Video Views",
    "Video Consumed Hours",
  ];
  const rows: unknown[][] = [header];
  for (const r of data.rows) {
    const t = config?.publications?.[r.publication]?.targets;
    rows.push([
      data.weekEnd ?? data.weekStart,
      shortName(config, r.publication),
      num(r.articlePublished),
      t ? t.article : "",
      num(r.articleViews),
      num(r.slideshowPublished),
      t ? t.slideshow : "",
      num(r.slideshowViews),
      num(r.videoPublished),
      t ? t.video : "",
      num(r.videoViews),
      num(r.videoConsumedHours),
    ]);
  }
  downloadCsv(`MSN_EOW_${data.weekStart}.csv`, rows);
}

/** "MSN MTD": Month, As of, Feed, Article/Slideshow/Video Views, Consumed Hours. */
export function exportMtd(
  data: MtdReportResult,
  config: ReportsConfig | undefined,
): void {
  const header = [
    "Month",
    "As of",
    "Feed Name",
    "Article Views",
    "Slideshow Views",
    "Video Views",
    "Video Consumed Hours",
  ];
  const rows: unknown[][] = [header];
  for (const r of data.rows) {
    rows.push([
      data.month,
      data.asOf ?? "",
      shortName(config, r.publication),
      num(r.articleViews),
      num(r.slideshowViews),
      num(r.videoViews),
      num(r.videoConsumedHours),
    ]);
  }
  downloadCsv(`MSN_MTD_${data.month}.csv`, rows);
}
