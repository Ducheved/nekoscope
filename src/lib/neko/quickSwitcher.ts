import type { FileTreeEntry } from "./types";

export function rankFiles(
  entries: FileTreeEntry[],
  query: string,
  recent: string[] = [],
) {
  const needle = query.trim().toLowerCase();
  return entries
    .filter((entry) => !entry.isDir)
    .map((entry) => ({
      entry,
      score:
        (entry.name.toLowerCase().startsWith(needle) ? 50 : 0) +
        (entry.path.toLowerCase().includes(needle) ? 20 : 0) +
        Math.max(0, 15 - recent.indexOf(entry.path)),
    }))
    .filter((item) => !needle || item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.path.localeCompare(right.entry.path),
    )
    .map((item) => item.entry);
}
