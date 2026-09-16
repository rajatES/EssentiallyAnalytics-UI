import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPageDirectory, type PageDirectoryEntry } from "./api";
import type { TrafficPlatformKey } from "./traffic-platforms";

/**
 * Turning a page name in a table into a link you can click.
 *
 * Browser half of ES_Studio_API/src/common/page-links.ts — the URL shapes are
 * duplicated deliberately, the same way the traffic platform registry is, so
 * a row can still resolve locally from an identifier it already holds when the
 * directory request hasn't landed (or has failed).
 *
 * Resolution order, most trustworthy first:
 *   1. an explicit override stored on the row's mapping
 *   2. the directory, matched on platform identifier
 *   3. the directory, matched on normalised page name
 *   4. a URL derived from whatever the row itself carries
 *
 * Every step can return null, and null means the name renders as plain text.
 */

export type PageLinkPlatform = "facebook" | "instagram" | "threads" | "reddit";

const PLATFORM_ALIASES: Record<string, PageLinkPlatform> = {
  fb: "facebook",
  facebook: "facebook",
  ig: "instagram",
  instagram: "instagram",
  threads: "threads",
  reddit: "reddit",
  subreddit: "reddit",
};

/** Accepts a traffic platform key, a `platform` label, or a Meta platform. */
export function toPageLinkPlatform(
  value: string | null | undefined,
): PageLinkPlatform | null {
  return PLATFORM_ALIASES[(value || "").trim().toLowerCase()] ?? null;
}

export function trafficPlatformToLinkPlatform(
  key: TrafficPlatformKey,
): PageLinkPlatform {
  return key === "fb" ? "facebook" : key;
}

/**
 * Whether a hand-entered override is something a browser can open.
 *
 * The value is rendered straight into an href, so anything that isn't http(s)
 * is refused — a `javascript:` URL saved in the mappings editor would
 * otherwise run for every viewer of three dashboards.
 */
export function normalizeExplicitUrl(
  raw: string | null | undefined,
): string | null {
  const value = (raw || "").trim();
  if (!value) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!hasScheme && !parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function cleanHandle(raw: string | null | undefined): string | null {
  const value = (raw || "").trim().replace(/^@+/, "").replace(/^r\//i, "");
  return /^[A-Za-z0-9._-]+$/.test(value) ? value : null;
}

export interface PageLinkInput {
  platform: PageLinkPlatform | null;
  /** Numeric platform identifier. Only Facebook Page IDs resolve as a URL. */
  id?: string | null;
  handle?: string | null;
  name?: string | null;
  explicitUrl?: string | null;
}

/** The URL for one account from its own fields, or null if we can't tell. */
export function buildPageUrl(input: PageLinkInput): string | null {
  const explicit = normalizeExplicitUrl(input.explicitUrl);
  if (explicit) return explicit;

  const id = (input.id || "").trim();
  const handle = cleanHandle(input.handle);

  switch (input.platform) {
    case "facebook":
      if (id && /^\d+$/.test(id)) return `https://www.facebook.com/${id}`;
      if (handle) return `https://www.facebook.com/${handle}`;
      return null;

    case "instagram":
      // An IG Business Account ID is not the number in a profile URL, so
      // unlike Facebook there is no id fallback here.
      return handle ? `https://www.instagram.com/${handle}/` : null;

    case "threads":
      return handle ? `https://www.threads.com/@${handle}` : null;

    case "reddit": {
      const name = (input.name || "").trim();
      const sub = /^r\//i.test(name) ? cleanHandle(name) : handle;
      return sub ? `https://www.reddit.com/r/${sub}` : null;
    }

    default:
      return null;
  }
}

/**
 * Match key for pairing a name typed into a mappings sheet with the same
 * account as Meta spells it — 'ES Golf' / 'es-golf' / 'ESGolf'.
 */
export function pageNameKey(name: string | null | undefined): string {
  return (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface PageLinkIndex {
  /** URL for a row, or null when it should stay plain text. */
  resolve(input: PageLinkInput): string | null;
  /** True once the directory has loaded; useful only for skeletons. */
  ready: boolean;
}

const EMPTY_INDEX: PageLinkIndex = {
  resolve: (input) => buildPageUrl(input),
  ready: false,
};

export function buildPageLinkIndex(
  entries: PageDirectoryEntry[],
): PageLinkIndex {
  const byId = new Map<string, string>();
  const byName = new Map<string, string>();

  for (const entry of entries) {
    if (entry.id) byId.set(`${entry.platform}::${entry.id}`, entry.url);
    byName.set(`${entry.platform}::${entry.key}`, entry.url);
  }

  return {
    ready: true,
    resolve(input) {
      const explicit = normalizeExplicitUrl(input.explicitUrl);
      if (explicit) return explicit;
      if (!input.platform) return null;

      if (input.id) {
        const hit = byId.get(`${input.platform}::${input.id}`);
        if (hit) return hit;
      }
      if (input.name) {
        const hit = byName.get(`${input.platform}::${pageNameKey(input.name)}`);
        if (hit) return hit;
      }
      return buildPageUrl(input);
    },
  };
}

/**
 * The shared link index. Cached for the session — the directory only changes
 * when someone edits a mapping or connects a profile.
 */
export function usePageLinks(): PageLinkIndex {
  const { data } = useQuery({
    queryKey: ["page-directory"],
    queryFn: fetchPageDirectory,
    staleTime: 1000 * 60 * 60,
  });

  // Rebuilding the lookup maps on every render would undo the point of them:
  // these tables re-render on each metric toggle and hold hundreds of rows.
  return useMemo(
    () => (data ? buildPageLinkIndex(data) : EMPTY_INDEX),
    [data],
  );
}
