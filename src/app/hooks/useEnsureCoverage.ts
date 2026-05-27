import { useEffect } from "react";

/**
 * Module-level dedupe set. Persists across component mounts/unmounts for the
 * lifetime of the page session, so the same (profiles + range) request is never
 * fired twice — preventing re-trigger loops when a date genuinely has no data.
 */
const requested = new Set<string>();

/**
 * On-demand backfill hook.
 *
 * When a date range is selected that may have missing dates in the DB, this
 * pings the backend `ensure-coverage` endpoint. The backend detects any dates
 * with no real data and queues a resync for the missing span. The global
 * GlobalSyncScreen poller picks up the queued jobs and invalidates the report
 * queries on completion, so charts refill automatically.
 *
 * Safe to call from multiple tabs — requests are deduped per
 * (profileIds + startDate + endDate).
 */
export function useEnsureCoverage(
  profileIds: string[],
  startDate: string,
  endDate: string,
  enabled: boolean = true,
) {
  const key =
    enabled && profileIds.length > 0 && startDate && endDate
      ? `${[...profileIds].sort().join(",")}|${startDate}|${endDate}`
      : "";

  useEffect(() => {
    if (!key) return;
    if (requested.has(key)) return;
    requested.add(key);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${BACKEND_URL}/api/analytics/ensure-coverage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ profileIds, startDate, endDate }),
    }).catch(() => {
      // Allow a retry on network failure
      requested.delete(key);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
