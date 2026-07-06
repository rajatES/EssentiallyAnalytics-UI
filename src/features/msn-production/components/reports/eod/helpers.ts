import type { EodReportRow, ReportsConfig } from "../../../types";

export const CONTENT_TYPES = ["Article", "Gallery", "Video"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const TYPE_LABEL: Record<ContentType, string> = {
  Article: "Article",
  Gallery: "Slideshow",
  Video: "Video",
};

export const TYPE_COLOR: Record<ContentType, string> = {
  Article: "#6366f1", // indigo-500
  Gallery: "#38bdf8", // sky-400
  Video: "#fbbf24", // amber-400
};

export const REGION_ORDER = [
  "USA",
  "UK",
  "CAN",
  "AUS",
  "NZ",
  "MY",
  "PH",
  "SGPR",
  "IN",
];

/** Region tiers, matching the retired sheet's tier formulas. */
export const DEFAULT_REGION_TIERS: Record<string, string[]> = {
  T1: ["USA", "UK", "CAN", "AUS", "NZ"],
  T2: ["MY", "PH", "SGPR"],
  T3: ["IN"],
};

/** Sum one content type's views across all regions for a publication. */
export function typeTotal(row: EodReportRow, type: string): number {
  return Object.values(row.views?.[type] ?? {}).reduce(
    (a, b) => a + (b || 0),
    0,
  );
}

/** Sum a content type's views over the given regions; null if none present. */
export function tierViews(
  row: EodReportRow,
  type: string,
  regions: string[],
): number | null {
  const byRegion = row.views?.[type] ?? {};
  let sum = 0;
  let seen = false;
  for (const r of regions) {
    if (byRegion[r] != null) {
      sum += byRegion[r] || 0;
      seen = true;
    }
  }
  return seen ? sum : null;
}

/** Regions present for a row, in canonical order then any extras. */
export function regionsFor(row: EodReportRow): string[] {
  const present = new Set<string>();
  for (const type of CONTENT_TYPES) {
    for (const r of Object.keys(row.views?.[type] ?? {})) present.add(r);
  }
  return [
    ...REGION_ORDER.filter((r) => present.has(r)),
    ...[...present].filter((r) => !REGION_ORDER.includes(r)).sort(),
  ];
}

export function shortName(
  config: ReportsConfig | undefined,
  pub: string,
): string {
  return config?.publications?.[pub]?.shortName ?? pub;
}

export function tierOf(
  config: ReportsConfig | undefined,
  pub: string,
): string | undefined {
  return config?.publications?.[pub]?.tier;
}

/** Order rows by config (tier then feed order); unknown feeds sorted last. */
export function orderRows(
  rows: EodReportRow[],
  config: ReportsConfig | undefined,
): EodReportRow[] {
  const order = Object.keys(config?.publications ?? {});
  return [...rows].sort((a, b) => {
    const ia = order.indexOf(a.publication);
    const ib = order.indexOf(b.publication);
    if (ia === -1 && ib === -1)
      return a.publication.localeCompare(b.publication);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
