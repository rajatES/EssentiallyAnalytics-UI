// 'Other' collects pages no mapping matched, 'Unassigned' pages with no team.
// Neither is a real category, so they sit under the groups that are.
const RESIDUAL_GROUPS = ["other", "others", "unassigned"];

const residualRank = (name: string) => {
  const idx = RESIDUAL_GROUPS.indexOf(name.trim().toLowerCase());
  return idx === -1 ? 0 : idx + 1;
};

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
