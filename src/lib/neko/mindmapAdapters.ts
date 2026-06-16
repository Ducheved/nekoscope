import YAML from "yaml";
import { extractOutline } from "./markdownLens";
import type { MindmapNode } from "./types";

export function markdownToMindmap(source: string): MindmapNode {
  const root: MindmapNode = {
    id: "root",
    label: "Document",
    depth: 0,
    children: [],
  };
  const stack: MindmapNode[] = [root];
  for (const item of extractOutline(source)) {
    const node: MindmapNode = {
      id: item.id,
      label: item.text,
      depth: item.level,
      children: [],
    };
    while (stack.length > 1 && stack[stack.length - 1].depth >= item.level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root;
}

export function mermaidMindmapToTree(source: string): MindmapNode {
  const root: MindmapNode = {
    id: "mermaid-root",
    label: "Mermaid",
    depth: 0,
    children: [],
  };
  const stack: MindmapNode[] = [root];
  for (const rawLine of source.split("\n")) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    if (!trimmed || trimmed === "mindmap") continue;
    const depth = Math.floor((line.length - line.trimStart().length) / 2) + 1;
    const label = trimmed.replace(/^\)+|\(+$/g, "").trim();
    const node: MindmapNode = {
      id: `${depth}-${label.toLowerCase().replace(/\s+/g, "-")}`,
      label,
      depth,
      children: [],
    };
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth)
      stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root;
}

export function jsonToMindmap(source: string): MindmapNode {
  return valueToNode("json", JSON.parse(source), 0);
}

export function yamlToMindmap(source: string): MindmapNode {
  return valueToNode("yaml", YAML.parse(source), 0);
}

export function opmlToMindmap(source: string): MindmapNode {
  const root: MindmapNode = {
    id: "opml",
    label: "OPML",
    depth: 0,
    children: [],
  };
  for (const match of source.matchAll(/<outline[^>]+text="([^"]+)"/g)) {
    root.children.push({
      id: match[1].toLowerCase().replace(/\s+/g, "-"),
      label: match[1],
      depth: 1,
      children: [],
    });
  }
  return root;
}

export function freemindToMindmap(source: string): MindmapNode {
  const root: MindmapNode = {
    id: "freemind",
    label: "FreeMind",
    depth: 0,
    children: [],
  };
  for (const match of source.matchAll(/<node[^>]+TEXT="([^"]+)"/g)) {
    root.children.push({
      id: match[1].toLowerCase().replace(/\s+/g, "-"),
      label: match[1],
      depth: 1,
      children: [],
    });
  }
  return root;
}

function valueToNode(
  label: string,
  value: unknown,
  depth: number,
): MindmapNode {
  const node: MindmapNode = {
    id: `${depth}-${label}`,
    label,
    depth,
    children: [],
  };
  if (Array.isArray(value)) {
    node.children = value.map((item, index) =>
      valueToNode(String(index), item, depth + 1),
    );
  } else if (value && typeof value === "object") {
    node.children = Object.entries(value).map(([key, item]) =>
      valueToNode(key, item, depth + 1),
    );
  } else if (value !== undefined) {
    node.children = [
      {
        id: `${node.id}-value`,
        label: String(value),
        depth: depth + 1,
        children: [],
      },
    ];
  }
  return node;
}
