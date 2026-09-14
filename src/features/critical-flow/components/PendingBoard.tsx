"use client";

import type { PendingResult } from "../types";
import { fmtHours, fmtInt, STAGE_COLOR, ageTone, AGE_TONE_CLASS } from "../format";

interface Props {
  data?: PendingResult;
  isLoading: boolean;
}

/** The four queues a piece can sit in, in pipeline order. */
const STAGE_ORDER = [
  "Awaiting Submission",
  "Awaiting Editorial",
  "Sent Back",
  "Awaiting Live",
];

export default function PendingBoard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" />
    );
  }

  const byStage = new Map(data.buckets.map((b) => [b.stage, b]));
  const total = data.buckets.reduce((s, b) => s + b.count, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Work in Queue
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Pieces not yet published, by the stage holding them
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {fmtInt(total)} total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAGE_ORDER.map((stage) => {
          const b = byStage.get(stage);
          const count = b?.count ?? 0;
          const oldest = b?.oldestAgeHours ?? 0;
          return (
            <div
              key={stage}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/30"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: STAGE_COLOR[stage] }}
                />
                <p className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {stage}
                </p>
              </div>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                {fmtInt(count)}
              </p>
              {count > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    med {fmtHours(b?.medianAgeHours)}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      AGE_TONE_CLASS[ageTone(oldest)]
                    }`}
                  >
                    oldest {fmtHours(oldest)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.byDivision.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {data.byDivision.map((d) => {
            const max = Math.max(...data.byDivision.map((x) => x.total), 1);
            return (
              <div key={d.division} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {d.division}
                </span>
                <div className="flex h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full"
                    style={{
                      width: `${(d.awaitingSubmission / max) * 100}%`,
                      background: STAGE_COLOR["Awaiting Submission"],
                    }}
                    title={`${d.awaitingSubmission} awaiting submission`}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(d.awaitingEditorial / max) * 100}%`,
                      background: STAGE_COLOR["Awaiting Editorial"],
                    }}
                    title={`${d.awaitingEditorial} in editorial`}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(d.awaitingLive / max) * 100}%`,
                      background: STAGE_COLOR["Awaiting Live"],
                    }}
                    title={`${d.awaitingLive} awaiting live`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-gray-500 dark:text-gray-400">
                  {d.total}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
