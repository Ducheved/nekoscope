export type LocaleCode = "en" | "ru" | "ja" | "zh";

export type ThemeMode = "system" | "light" | "dark";

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

export interface LinkNode {
  path: string;
  title: string;
}

export interface LinkEdge {
  source: string;
  target: string;
  kind: string;
}

export interface LinkGraph {
  nodes: LinkNode[];
  edges: LinkEdge[];
  brokenLinks: LinkEdge[];
}

export interface DevopsSummary {
  documentType: string;
  title?: string | null;
  highlights: string[];
  warnings: string[];
}

export interface MetricValue {
  name: string;
  value: string;
}

export interface MlSummary {
  documentType: string;
  title?: string | null;
  metrics: MetricValue[];
  signals: string[];
}

export interface CommentItem {
  id: string;
  path: string;
  anchor: string;
  text: string;
  state: "open" | "resolved";
  createdAt: string;
}

export interface HeaderPair {
  name: string;
  value: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  providerType:
    | "openai-compatible"
    | "anthropic-compatible"
    | "ollama"
    | "generic-http";
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  apiKey?: string | null;
  headers: HeaderPair[];
  requestTemplate?: string | null;
}

export interface SyncProfile {
  id: string;
  name: string;
  providerType: "local-folder" | "network-share" | "cloud-mounted-folder";
  rootPath: string;
  enabled: boolean;
}

export interface AppSettings {
  locale: LocaleCode;
  theme: ThemeMode;
  fontScale: number;
  diagramScale: number;
  providerProfile: ProviderProfile;
  syncProfiles: SyncProfile[];
  includeCurrentFile: boolean;
  includeSelectedText: boolean;
  includeRenderedOutline: boolean;
  includeFolderIndex: boolean;
  includeComments: boolean;
  secretRedaction: boolean;
  trustedHtmlWorkspaces: string[];
}

export interface AiContextFile {
  path: string;
  content: string;
}

export interface AiRequest {
  profile: ProviderProfile;
  prompt: string;
  context: AiContextFile[];
}

export interface AiResponse {
  provider: string;
  model: string;
  contextBytes: number;
  redactedPrompt: string;
  requestPreview: unknown;
}

export interface MindmapNode {
  id: string;
  label: string;
  depth: number;
  children: MindmapNode[];
}

export interface CommandAction {
  id: string;
  label: string;
  shortcut: string;
  panel: string;
}
