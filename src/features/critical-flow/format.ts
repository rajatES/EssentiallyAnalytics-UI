/**
 * Formatting helpers for the Critical Flow views.
 *
 * Every number goes through an explicit "en-US" locale: the Node process this
 * renders under and the browser that hydrates it do not agree on a default
 * locale, and a bare toLocaleString() produces different digit grouping on
 * each side, which React reports as a hydration mismatch.
 */

/** Compact human duration from hours: 45m / 6.5h / 2.3d. */
export function fmtHours(h: number | null | undefined): string {
  if (h == null || isNaN(h) || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${Math.round(h * 10) / 10}h`;
  return `${Math.round((h / 24) * 10) / 10}d`;
}

export function fmtPct(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return `${Math.round(v * 10) / 10}%`;
}

export function fmtInt(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return Math.round(v).toLocaleString("en-US");
}

export function fmtDec(v: number | null | undefined, digits = 1): string {
  if (v == null || isNaN(v)) return "—";
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export type AgeTone = "ok" | "warn" | "bad";

/** Freshness tone for queued work: <24h fine, <72h warning, else alarming. */
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

/**
 * Send-back rate tone. Inverted against ageTone: a low rate is the good case,
 * and anything past a fifth of output going back is worth flagging.
 */
export function rateTone(pctValue: number): AgeTone {
  if (pctValue < 5) return "ok";
  if (pctValue < 15) return "warn";
  return "bad";
}

/** Colour per pipeline queue, shared by the board, charts and tables. */
export const STAGE_COLOR: Record<string, string> = {
  "Awaiting Submission": "#6366f1",
  "Awaiting Editorial": "#f59e0b",
  "Sent Back": "#f43f5e",
  "Awaiting Live": "#10b981",
};

export const STAGE_CLASS: Record<string, string> = {
  "Awaiting Submission":
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Awaiting Editorial":
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Sent Back": "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "Awaiting Live":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

/** Short date label for chart axes: "12 Sep". */
export function fmtDay(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

/** Relative age from an ISO timestamp: "3h ago", "2d ago". */
export function fmtAgo(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}
