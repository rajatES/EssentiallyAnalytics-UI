// 'Other' collects rows no mapping matched, 'Unassigned'/'Uncategorized' rows
// with no team or sport. None is a real category, so they sit under the ones
// that are, whatever order the rest of the table is in.
const RESIDUAL_GROUPS = ["other", "others", "unassigned", "uncategorized"];

export function residualRank(name: string): number {
  const idx = RESIDUAL_GROUPS.indexOf(name.trim().toLowerCase());
  return idx === -1 ? 0 : idx + 1;
}

// Sorts group entries with `compare`, after pinning the residual buckets to the
// bottom. Mutates and returns `entries`, like Array.sort.
export function sortGroupEntries<T>(
  entries: Array<[string, T]>,
  compare: (a: [string, T], b: [string, T]) => number,
): Array<[string, T]> {
  return entries.sort((a, b) => {
    const rank = residualRank(a[0]) - residualRank(b[0]);
    return rank !== 0 ? rank : compare(a, b);
  });
}
