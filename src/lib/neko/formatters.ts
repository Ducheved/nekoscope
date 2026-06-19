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
  if (isBinaryExtension(lower)) return "binary";
  return "text";
}

const binaryExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".webp",
  ".tif",
  ".tiff",
  ".avif",
  ".pdf",
  ".zip",
  ".gz",
  ".tgz",
  ".tar",
  ".7z",
  ".rar",
  ".bz2",
  ".xz",
  ".zst",
  ".mp3",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".wav",
  ".flac",
  ".ogg",
  ".m4a",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".class",
  ".jar",
  ".wasm",
  ".node",
  ".pdb",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".db",
  ".sqlite",
  ".sqlite3",
  ".pyc",
];

function isBinaryExtension(lower: string) {
  return binaryExtensions.some((ext) => lower.endsWith(ext));
}

function looksLikeJson(content: string) {
  const trimmed = content.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}
