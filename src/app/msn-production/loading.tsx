const bar =
  "animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50";
const pill =
  "h-9 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-4 px-4 pb-6 pt-4 lg:px-6">
      {/* Header: tabs + filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${pill} w-24`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${pill} w-12`} />
            ))}
            <div className={`${pill} w-32`} />
          </div>
        </div>
      </div>

      {/* KPI hero row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${bar} h-[92px]`} />
        ))}
      </div>

      {/* Stage board */}
      <div className={`${bar} h-44`} />

      {/* Moderation + duplicates overview strips */}
      <div className={`${bar} h-20`} />
      <div className={`${bar} h-20`} />

      {/* Throughput chart + category split */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className={`${bar} h-72 xl:col-span-3`} />
        <div className={`${bar} h-72 xl:col-span-2`} />
      </div>

      {/* Table */}
      <div className={`${bar} h-72`} />
    </div>
  );
}
