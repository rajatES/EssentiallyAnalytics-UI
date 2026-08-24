import { Database, AlertCircle } from "lucide-react";
import { HeadlineData } from "@/types";
import { HeadlineChips } from "./HeadlineChips";

interface HeadlinesProps {
  data: HeadlineData | null;
  loading: boolean;
  rawData: { sessions: number | string }[];
  mappedSessions: number;
}

export function Headlines({
  data,
  loading,
  rawData,
  mappedSessions,
}: HeadlinesProps) {
  if (loading || !data) return null;

  const totalRawSessions =
    rawData?.reduce((acc, curr) => acc + Number(curr.sessions || 0), 0) || 0;

  const unmappedSessions = Math.max(0, totalRawSessions - mappedSessions);
  const leakagePercent =
    totalRawSessions > 0
      ? ((unmappedSessions / totalRawSessions) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-0">
      <HeadlineChips windows={data} metricLabel="sessions" loading={loading} />

      {/* Mapping leakage — a data-quality check, not a period comparison. */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Database className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total API Traffic
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {totalRawSessions.toLocaleString("en-US")}{" "}
            <span className="text-xs font-normal text-gray-400">sessions</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Unmapped:{" "}
            <span
              className={
                unmappedSessions > 0
                  ? "text-amber-500 font-bold"
                  : "text-green-500 font-bold"
              }
            >
              {unmappedSessions.toLocaleString("en-US")}
            </span>
          </p>
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${unmappedSessions > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-green-100 text-green-700"}`}
        >
          {unmappedSessions > 0 && <AlertCircle className="w-4 h-4" />}
          {leakagePercent}% Leak
        </div>
      </div>
    </div>
  );
}
