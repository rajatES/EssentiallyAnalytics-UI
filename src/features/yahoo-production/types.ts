// Yahoo Production types. The analytics result shapes are identical to
// Critical Flow's — the same lifecycle over a different source — so they are
// re-exported rather than restated, and only Yahoo's own shapes are declared
// here. Mirrors the API at src/modules/yahoo-production/types.ts.

export * from "@/features/critical-flow/types";

/**
 * A quota row and how the selected period measured against it. Grouped by
 * quota row rather than by division, because one row can cover two content
 * divisions ("Tennis+Olympics") and splitting it would compare each half
 * against the whole target.
 */
export interface YpQuotaAttainment {
  quotaGroup: string;
  divisions: string[];
  quota: number | null;
  window: string;
  poc: string;
  allotted: number;
  published: number;
  activeDays: number;
  perDay: number;
  attainment: number | null;
}
