import { extractStandardLinks, extractWikiLinks } from "./markdownLens";
import type { FilePayload, LinkGraph } from "./types";

export function buildLocalLinkGraph(files: FilePayload[]): LinkGraph {
  const markdown = files.filter((file) => file.kind === "markdown");
  const existing = new Set(markdown.map((file) => file.path));
  const edges = [];
  const brokenLinks = [];
  for (const file of markdown) {
    const targets = [
      ...extractWikiLinks(file.content),
      ...extractStandardLinks(file.content),
    ].map(normalizeTarget);
    for (const target of targets) {
      const edge = { source: file.path, target, kind: "markdown" };
      if (existing.has(target)) edges.push(edge);
      else brokenLinks.push(edge);
    }
  }
  return {
    nodes: markdown.map((file) => ({ path: file.path, title: file.name })),
    edges,
    brokenLinks,
  };
}

function normalizeTarget(value: string) {
  const clean = value.replace(/\\/g, "/").replace(/^.\//, "");
  return clean.endsWith(".md") || clean.endsWith(".markdown")
    ? clean
    : `${clean}.md`;
}
