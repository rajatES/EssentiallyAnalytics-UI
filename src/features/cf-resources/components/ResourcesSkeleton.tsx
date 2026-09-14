const bar =
  "animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50";

export default function ResourcesSkeleton() {
  return (
    <div className="min-h-screen space-y-4 px-4 pb-6 pt-4 lg:px-6">
      <div className={`${bar} h-24`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`${bar} h-40 rounded-xl`} />
        ))}
      </div>
      <div className={`${bar} h-[520px]`} />
      <div className={`${bar} h-40`} />
    </div>
  );
}
