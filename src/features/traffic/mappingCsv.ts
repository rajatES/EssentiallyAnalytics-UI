import type { MappingEntry } from "@/data/page-mapping";
import { downloadRowsCsv } from "@/lib/tableCsv";

export const MAPPING_CSV_HEADERS = ["category", "team", "platform", "pageName", "trackingLink", "pageUrl"];

/** The link a mapping row stands for. The importer splits it back into the utm fields. */
export function buildTrackingLink(p: {
  source?: string | null;
  medium: string;
  campaign?: string | null;
  term?: string | null;
}): string {
  const params = new URLSearchParams();
  if (p.source?.trim()) params.set("utm_source", p.source.trim());
  params.set("utm_medium", p.medium);
  if (p.campaign?.trim()) params.set("utm_campaign", p.campaign.trim());
  if (p.term?.trim()) params.set("utm_term", p.term.trim());
  return `?${params.toString()}`;
}

/**
 * Download mappings in the shape managers upload: one tracking link per line.
 *
 * A row holding several mediums becomes one line per medium, because a link
 * carries one; matching treats the two the same. Platform stays its own column
 * because some rows' label disagrees with their utmSource, and re-deriving it
 * from the link on import would move them to another tab.
 */
export function downloadMappingsCsv(rows: MappingEntry[], filename = "traffic-page-mappings") {
  const lines = rows.flatMap((m) => {
    const line = (link: string) => [m.category, m.team ?? "", m.platform, m.pageName, link, m.pageUrl ?? ""];
    const mediums = (m.utmMediums || []).map((s) => s.trim()).filter(Boolean);
    if (!mediums.length) return [line("")];
    return mediums.map((medium) =>
      line(buildTrackingLink({ source: m.utmSource, medium, campaign: m.utmCampaign, term: m.utmTerm })),
    );
  });
  downloadRowsCsv(MAPPING_CSV_HEADERS, lines, filename);
}
