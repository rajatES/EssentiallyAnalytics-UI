"use client";

import { AlertTriangle } from "lucide-react";
import type { StageDurationResult } from "../types";
import { fmtHours } from "../format";

interface Props {
  data?: StageDurationResult;
  isLoading: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  "Pick Latency": "Allot → Pick",
  Writing: "Pick → Submit",
  Editing: "Review",
  "To Publish": "Submit → Publish",
};

const STAGE_COLORS = ["bg-indigo-400", "bg-violet-400", "bg-fuchsia-400", "bg-sky-400"];

export default function StageDurationCards({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-56 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const flow = data.stages.filter((s) => s.stage !== "Total Lead");
  const total = data.stages.find((s) => s.stage === "Total Lead");
  const sum = flow.reduce((a, s) => a + s.medianHours, 0);
  const bottleneck =
    flow.length > 0
      ? flow.reduce((max, s) => (s.medianHours > max.medianHours ? s : max))
      : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Stage Durations
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Median time a piece spends in each stage
          </p>
        </div>
        {total && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Full cycle median{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {fmtHours(total.medianHours)}
            </span>{" "}
            · p90 {fmtHours(total.p90Hours)}
          </p>
        )}
      </div>

      {/* Share-of-cycle bar */}
      {sum > 0 && (
        <div className="mb-4">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {flow.map((s, i) => (
              <div
                key={s.stage}
                className={STAGE_COLORS[i % STAGE_COLORS.length]}
                style={{ width: `${(s.medianHours / sum) * 100}%` }}
                title={`${s.stage}: ${fmtHours(s.medianHours)} (${Math.round((s.medianHours / sum) * 100)}% of cycle)`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {flow.map((s, i) => {
          const isBottleneck = bottleneck?.stage === s.stage && s.medianHours > 0;
          return (
            <div
              key={s.stage}
              className={`rounded-xl border p-3.5 ${
                isBottleneck
                  ? "border-rose-200 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/5"
                  : "border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span
                    className={`h-2 w-2 rounded-sm ${STAGE_COLORS[i % STAGE_COLORS.length]}`}
                  />
                  {s.stage}
                </span>
                {isBottleneck && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                    <AlertTriangle size={10} />
                    Bottleneck
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {fmtHours(s.medianHours)}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                {STAGE_LABELS[s.stage] ?? ""} · p90 {fmtHours(s.p90Hours)} · n=
                {s.sampleSize}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
