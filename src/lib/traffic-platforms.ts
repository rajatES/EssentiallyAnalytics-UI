import { Facebook, Layers, MessagesSquare, type LucideIcon } from "lucide-react";

/**
 * Frontend half of the platform registry. The backend owns the full list of
 * utm_source spellings (see ES_Studio_API/src/common/traffic-platforms.ts) —
 * the UI only needs the platform key it sends as `utmSource`, how to label it,
 * and how to decide which platform a page-mapping row belongs to.
 */
export type TrafficPlatformKey = "fb" | "threads" | "reddit";

export interface TrafficPlatformUi {
  key: TrafficPlatformKey;
  label: string;
  /** Short label for CSV titles. */
  shortLabel: string;
  icon: LucideIcon;
  /** Tailwind classes for the selected state of the platform toggle. */
  activeClass: string;
  /**
   * `utmSource` values a page-mapping row may carry for this platform, and the
   * `platform` labels it may carry. A mapping matches on either — see
   * platformKeysForMapping().
   */
  mappingSources: string[];
  mappingLabels: string[];
}

export const TRAFFIC_PLATFORMS: TrafficPlatformUi[] = [
  {
    key: "fb",
    label: "Facebook",
    shortLabel: "FB",
    icon: Facebook,
    activeClass: "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400",
    mappingSources: ["fb"],
    mappingLabels: ["facebook"],
  },
  {
    key: "threads",
    label: "Threads",
    shortLabel: "Threads",
    icon: Layers,
    activeClass: "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white",
    mappingSources: ["threads"],
    mappingLabels: ["threads"],
  },
  {
    key: "reddit",
    label: "Reddit",
    shortLabel: "Reddit",
    icon: MessagesSquare,
    activeClass: "bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400",
    mappingSources: ["reddit", "subreddit"],
    mappingLabels: ["reddit"],
  },
];

export const DEFAULT_PLATFORM_KEY: TrafficPlatformKey = "fb";

/** Platform labels offered by the mapping editor dropdowns. */
export const PLATFORM_LABEL_OPTIONS = TRAFFIC_PLATFORMS.map((p) => p.label);

export function getPlatform(key: TrafficPlatformKey): TrafficPlatformUi {
  return TRAFFIC_PLATFORMS.find((p) => p.key === key) ?? TRAFFIC_PLATFORMS[0];
}

export function platformLabel(key: TrafficPlatformKey): string {
  return getPlatform(key).label;
}

/**
 * Platform label ("Reddit") → the utmSource a mapping row should store ("reddit").
 *
 * The mapping editor has no utmSource field — it used to hardcode "fb" for
 * every row it created, which put new non-Facebook pages on the wrong tab.
 */
export function platformKeyFromLabel(
  label: string,
): TrafficPlatformKey | undefined {
  const lower = (label || "").trim().toLowerCase();
  return TRAFFIC_PLATFORMS.find((p) => p.mappingLabels.includes(lower))?.key;
}

/**
 * Which platform tabs a page-mapping row applies to.
 *
 * Matching on `utmSource` OR `platform` is deliberate. The table holds rows
 * where the two disagree (platform 'Threads' with utmSource 'fb'), and those
 * rows resolved on both tabs before mappings were platform-scoped — matching on
 * either keeps them working instead of silently dropping their page names.
 *
 * A row whose values match no known platform applies everywhere, preserving the
 * old unscoped behaviour for unrecognised data rather than losing the mapping.
 */
export function platformKeysForMapping(mapping: {
  utmSource?: string | null;
  platform?: string | null;
}): TrafficPlatformKey[] {
  const source = (mapping.utmSource || "").trim().toLowerCase();
  const label = (mapping.platform || "").trim().toLowerCase();

  const keys = new Set<TrafficPlatformKey>();
  for (const p of TRAFFIC_PLATFORMS) {
    if (source && p.mappingSources.includes(source)) keys.add(p.key);
    if (label && p.mappingLabels.includes(label)) keys.add(p.key);
  }

  return keys.size ? Array.from(keys) : TRAFFIC_PLATFORMS.map((p) => p.key);
}
