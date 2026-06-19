export type LocaleCode = "en" | "ru" | "ja" | "zh";

export type ThemeMode = "system" | "light" | "dark";

export type ViewMode = "rendered" | "source" | "split";

export type DocumentKind =
  | "markdown"
  | "json"
  | "jsonc"
  | "yaml"
  | "toml"
  | "env"
  | "xml"
  | "terraform"
  | "dockerfile"
  | "notebook"
  | "mindmap"
  | "opml"
  | "text"
  | "binary";

export interface WorkspaceSummary {
  path: string;
  name: string;
  fileCount: number;
  markdownCount: number;
  configCount: number;
  gitBranch?: string | null;
}

export interface FileTreeEntry {
  path: string;
  name: string;
  kind: DocumentKind;
  isDir: boolean;
  size: number;
  modifiedMs?: number | null;
}

export interface FilePayload {
  path: string;
  name: string;
  kind: DocumentKind;
  content: string;
  size: number;
}

export interface OpenResult {
  workspace: WorkspaceSummary;
  entries: FileTreeEntry[];
  file: FilePayload | null;
  activePath: string | null;
}

export interface SearchResult {
  path: string;
  line: number;
  excerpt: string;
}

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

export interface MarkdownStats {
  words: number;
  readingMinutes: number;
  headings: number;
}

export interface AppSettings {
  locale: LocaleCode;
  theme: ThemeMode;
  fontScale: number;
}

export interface CommandAction {
  id: string;
  shortcut: string;
}
