import { LucideIcon } from "lucide-react";
import { DeltaLabel } from "./DeltaLabel";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  subtext?: string;
  onClick?: () => void;
  loading?: boolean;
  /**
   * Comparison against another period, rendered directly under the value.
   * Omitted everywhere except the Compare tab, so existing cards are unchanged.
   */
  delta?: { pct: number | null; delta: number; baseline: number };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  subtext,
  onClick,
  loading,
  delta,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1"></div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
              </h3>
              {delta && (
                <DeltaLabel
                  pct={delta.pct}
                  delta={delta.delta}
                  baseline={delta.baseline}
                  size="sm"
                  showDelta
                  className="mt-1"
                />
              )}
            </>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-90`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
  );
}
