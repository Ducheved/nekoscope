import { mermaidMindmapToTree } from "./mindmapAdapters";
import type { MindmapNode } from "./types";

export interface DiagramBlock {
  language: string;
  source: string;
  line: number;
}

export function extractDiagramBlocks(source: string): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const pattern = /```(mermaid|plantuml|dot|graphviz|d2)\s*\n([\s\S]*?)```/g;
  for (const match of source.matchAll(pattern)) {
    blocks.push({
      language: match[1],
      source: match[2].trim(),
      line: source.slice(0, match.index ?? 0).split("\n").length,
    });
  }
  return blocks;
}

export function diagramToMindmap(block: DiagramBlock): MindmapNode {
  if (
    block.language === "mermaid" &&
    block.source.trimStart().startsWith("mindmap")
  ) {
    return mermaidMindmapToTree(block.source);
  }
  return {
    id: `${block.language}-${block.line}`,
    label: `${block.language} diagram`,
    depth: 0,
    children: block.source
      .split("\n")
      .filter(Boolean)
      .slice(0, 12)
      .map((line, index) => ({
        id: `${block.line}-${index}`,
        label: line.trim(),
        depth: 1,
        children: [],
      })),
  };
}

export async function renderMermaidSvg(source: string, id: string) {
  const mermaid = await import("mermaid");
  mermaid.default.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
  });
  const result = await mermaid.default.render(id, source);
  return result.svg;
}

export function renderMindmapSvg(root: MindmapNode, scale = 1) {
  const rows = flatten(root).filter((node) => node.depth > 0);
  const width = Math.max(
    760,
    240 + Math.max(1, ...rows.map((node) => node.depth)) * 180,
  );
  const height = Math.max(220, rows.length * 54 + 60);
  const nodes = rows
    .map((node, index) => {
      const x = 32 + node.depth * 170;
      const y = 34 + index * 54;
      return `<g><rect x="${x}" y="${y}" width="148" height="32" rx="8" fill="rgba(255,255,255,.78)" stroke="rgba(36,47,58,.18)"/><text x="${x + 12}" y="${y + 21}" font-size="13" fill="#182026">${escapeXml(node.label)}</text></g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f7eef3"/><text x="28" y="28" font-size="16" fill="#182026">${escapeXml(root.label)}</text>${nodes}</svg>`;
}

function flatten(root: MindmapNode): MindmapNode[] {
  return [root, ...root.children.flatMap(flatten)];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
