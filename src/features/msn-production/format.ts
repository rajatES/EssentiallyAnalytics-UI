/** Compact human duration from hours: 45m / 6.5h / 2.3d */
export function fmtHours(h: number | null | undefined): string {
  if (h == null || isNaN(h) || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${Math.round(h * 10) / 10}h`;
  return `${Math.round((h / 24) * 10) / 10}d`;
}

export type AgeTone = "ok" | "warn" | "bad";

/** Freshness tone for WIP ages: <24h fine, <72h warning, else alarming. */
export function ageTone(h: number): AgeTone {
  if (h < 24) return "ok";
  if (h < 72) return "warn";
  return "bad";
}

export const AGE_TONE_CLASS: Record<AgeTone, string> = {
  ok: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  bad: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export function fmtPct(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return `${Math.round(v * 10) / 10}%`;
}

/** Integer with thousands separators; em-dash for missing. */
export function fmtInt(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return Math.round(v).toLocaleString("en-US");
}

/** Decimal with thousands separators (e.g. consumed hours); em-dash for missing. */
export function fmtDec(v: number | null | undefined, digits = 1): string {
  if (v == null || isNaN(v)) return "—";
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

/** Compact number for axes/labels: 25k, 1.2M; em-dash for missing. */
export function fmtCompact(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
}
