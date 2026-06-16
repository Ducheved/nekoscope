import type { FileTreeEntry } from "./types";

export function visibleFiles(entries: FileTreeEntry[], filter: string) {
  const needle = filter.trim().toLowerCase();
  if (!needle) return entries;
  return entries.filter((entry) => entry.path.toLowerCase().includes(needle));
}

export function groupedFiles(entries: FileTreeEntry[]) {
  return {
    docs: entries.filter((entry) => ["markdown", "text"].includes(entry.kind)),
    devops: entries.filter((entry) =>
      ["yaml", "dockerfile", "terraform"].includes(entry.kind),
    ),
    data: entries.filter((entry) =>
      ["json", "jsonc", "toml", "env", "xml"].includes(entry.kind),
    ),
    maps: entries.filter((entry) => ["mindmap", "opml"].includes(entry.kind)),
  };
}

export function firstReadableFile(entries: FileTreeEntry[]) {
  return entries.find((entry) => !entry.isDir && entry.kind !== "binary");
}
