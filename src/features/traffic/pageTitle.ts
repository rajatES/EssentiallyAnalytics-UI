/**
 * Turn a landing-page path into a readable headline.
 *
 * Shared by the Overview and Compare tabs so the same article is labelled
 * identically in both. Labelling a landing-page row by its *mapped* page name
 * instead looks like duplicate rows — one mapping legitimately covers hundreds
 * of article paths (e.g. '/nfl-*' claims 310 of them), so the mapped name
 * belongs in a badge or sublabel, never in the row's identity.
 */
export function titleFromPath(path: string): string {
  const slug = (path || "").replace(/^\//, "").replace(/\/$/, "");
  if (!slug) return "Home";
  // Drop the leading section token ('wnba-basketball-news-...') and de-hyphenate.
  const words = slug.split("-").slice(1).join(" ");
  return (words || slug).replace(/\b\w/g, (c) => c.toUpperCase());
}
