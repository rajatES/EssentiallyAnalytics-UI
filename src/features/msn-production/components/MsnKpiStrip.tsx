import { TrendingUp, TrendingDown } from "lucide-react";
import type { KpiOverview } from "../types";

interface Props {
  data: KpiOverview | undefined;
  isLoading: boolean;
}

const CARDS: { key: keyof Omit<KpiOverview, "deltas">; label: string; suffix?: string; format?: "pct" | "hours" | "decimal" }[] = [
  { key: "totalProduced", label: "Total Produced" },
  { key: "totalAllotted", label: "Total Allotted" },
  { key: "published", label: "Published" },
  { key: "scheduled", label: "Scheduled" },
  { key: "publishRate", label: "Publish Rate", suffix: "%", format: "pct" },
  { key: "avgLeadTimeHours", label: "Median Lead Time", suffix: "h", format: "hours" },
  { key: "piecesPerWriterPerDay", label: "Pieces / Writer / Day", format: "decimal" },
  { key: "dropOffRate", label: "Drop-off Rate", suffix: "%", format: "pct" },
];

function formatVal(value: number, format?: string): string {
  if (format === "pct") return value.toFixed(1);
  if (format === "hours") return value.toFixed(1);
  if (format === "decimal") return value.toFixed(2);
  return value.toLocaleString();
}

export default function MsnKpiStrip({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {CARDS.map((c) => (
          <div key={c.key} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {CARDS.map((c) => {
        const value = (data[c.key] as number) ?? 0;
        const delta = data.deltas?.[c.key] ?? 0;
        const isPositive = c.key === "dropOffRate" || c.key === "avgLeadTimeHours" ? delta <= 0 : delta >= 0;

        return (
          <div
            key={c.key}
            className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {c.label}
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {formatVal(value, c.format)}
              {c.suffix && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{c.suffix}</span>}
            </p>
            {delta !== 0 && (
              <div
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isPositive
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(delta)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
