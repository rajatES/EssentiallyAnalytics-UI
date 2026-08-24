import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaLabelProps {
  /** null means "no baseline to compare against" — rendered as "new". */
  pct: number | null;
  /** Absolute change, shown in the tooltip and optionally inline. */
  delta?: number;
  /** The comparison value, for the tooltip ("vs 1,234"). */
  baseline?: number;
  size?: "xs" | "sm";
  showDelta?: boolean;
  /** Prefix the sign, so the value survives being read as plain text (CSV). */
  signed?: boolean;
  className?: string;
}

/**
 * The shared "% change" indicator: arrow, sign, magnitude.
 *
 * Used under a metric's value rather than beside it, so a comparison reads as an
 * annotation on the number instead of competing with it for attention. Matches
 * the pattern already used on the reports page.
 */
export function DeltaLabel({
  pct,
  delta,
  baseline,
  size = "xs",
  showDelta = false,
  signed = false,
  className,
}: DeltaLabelProps) {
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  const icon = size === "xs" ? 11 : 13;

  if (pct === null) {
    return (
      <span
        className={cn(text, "font-bold text-blue-600 dark:text-blue-400", className)}
        title={baseline !== undefined ? `vs ${baseline.toLocaleString("en-US")}` : undefined}
      >
        new
      </span>
    );
  }

  const flat = Math.abs(pct) < 0.05;
  const up = pct > 0;

  return (
    <span
      className={cn(
        text,
        "font-bold flex items-center gap-0.5 whitespace-nowrap",
        flat
          ? "text-gray-400 dark:text-gray-500"
          : up
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400",
        className,
      )}
      title={baseline !== undefined ? `vs ${baseline.toLocaleString("en-US")}` : undefined}
    >
      {flat ? (
        <Minus size={icon} />
      ) : up ? (
        <TrendingUp size={icon} />
      ) : (
        <TrendingDown size={icon} />
      )}
      {/* ASCII hyphen, not a minus glyph: this text is what CSV exports carry,
          and a spreadsheet only reads the former as a negative number. */}
      {signed && !flat && (up ? "+" : "-")}
      {Math.abs(pct).toFixed(1)}%
      {showDelta && delta !== undefined && !flat && (
        <span className="text-gray-400 font-semibold ml-0.5">
          ({delta > 0 ? "+" : ""}
          {delta.toLocaleString("en-US")})
        </span>
      )}
    </span>
  );
}
