import { splitPastedMedium } from "@/lib/page-mapping-match";

export interface ParsedTrackingLink {
  source: string | null;
  medium: string;
  campaign: string | null;
  term: string | null;
}

/**
 * Break a pasted tracking link into the fields a page mapping needs.
 *
 * Accepts the whole link, just its query string ('?utm_source=threads&…'), or
 * the tail that follows 'utm_medium=' — the medium/campaign/term split is the
 * same splitPastedMedium the API applies on save, so what the form shows is
 * what gets stored. Returns null when no utm_medium can be found.
 */
export function parseTrackingLink(raw: string): ParsedTrackingLink | null {
  // Links copied out of HTML or a chat preview often carry '&amp;' and a
  // '#fragment', neither of which belongs to any utm value.
  const text = (raw || "").trim().replace(/&amp;/gi, "&").split("#")[0];
  if (!/utm_/i.test(text)) return null;

  const { medium, campaign, term } = splitPastedMedium(text);
  if (!medium || medium.includes("=")) return null;

  const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
  const source = new URLSearchParams(query).get("utm_source");

  return {
    source: source?.trim() || null,
    medium,
    campaign: campaign?.trim() || null,
    term: term?.trim() || null,
  };
}
