import type { FileTreeEntry } from "./types";

export function visibleFiles(entries: FileTreeEntry[], filter: string) {
  const needle = filter.trim().toLowerCase();
  if (!needle) return entries;
  return entries.filter((entry) => entry.path.toLowerCase().includes(needle));
}
