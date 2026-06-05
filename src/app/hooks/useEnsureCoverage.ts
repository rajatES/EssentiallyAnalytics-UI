import { useEffect } from "react";

// Module-level set persists for the page session, preventing duplicate
// ensure-coverage requests for the same (profiles + range) combination.
const requested = new Set<string>();

/**
 * Pings the backend to detect and queue any missing date ranges in the DB.
 * The GlobalSyncScreen poller invalidates report queries once those jobs finish.
 * Deduped per (profileIds + startDate + endDate) across re-renders.
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
