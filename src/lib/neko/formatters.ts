import {
  applyEdits,
  format as formatJsoncEdits,
  parse as parseJsonc,
} from "jsonc-parser";
import * as toml from "smol-toml";
import YAML from "yaml";
import type { DocumentKind } from "./types";

export function detectDocumentKind(path: string, content = ""): DocumentKind {
  const lower = path.toLowerCase();
  if (
    lower.endsWith(".md") ||
    lower.endsWith(".markdown") ||
    lower.endsWith(".mdx")
  )
    return "markdown";
  if (lower.endsWith(".jsonc")) return "jsonc";
  if (lower.endsWith(".json") || looksLikeJson(content)) return "json";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  if (lower.endsWith(".toml")) return "toml";
  if (lower.endsWith(".env")) return "env";
  if (lower.endsWith(".xml")) return "xml";
  if (
    lower.endsWith(".tf") ||
    lower.endsWith(".tfvars") ||
    lower.endsWith(".hcl")
  )
    return "terraform";
  if (lower.endsWith("dockerfile")) return "dockerfile";
  if (lower.endsWith(".ipynb")) return "notebook";
  if (lower.endsWith(".mm")) return "mindmap";
  if (lower.endsWith(".opml")) return "opml";
  return "text";
}

export function isOneLineJson(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= 160 || trimmed.includes("\n")) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function formatDocument(path: string, content: string) {
  const kind = detectDocumentKind(path, content);
  if (kind === "json")
    return `${JSON.stringify(JSON.parse(content), null, 2)}\n`;
  if (kind === "jsonc") return formatJsonc(content);
  if (kind === "yaml") return YAML.stringify(YAML.parse(content));
  if (kind === "toml") return `${toml.stringify(toml.parse(content))}\n`;
  if (kind === "markdown" || kind === "text") return `${content.trimEnd()}\n`;
  throw new Error("Unsupported document format");
}

export function formatJsonc(content: string) {
  parseJsonc(content);
  return applyEdits(
    content,
    formatJsoncEdits(content, undefined, {
      insertSpaces: true,
      tabSize: 2,
      eol: "\n",
    }),
  );
}

function looksLikeJson(content: string) {
  const trimmed = content.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}
