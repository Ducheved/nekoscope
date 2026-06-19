import { detectDocumentKind } from "./formatters";
import type { FilePayload, FileTreeEntry, WorkspaceSummary } from "./types";

const files: Record<string, string> = {
  "README.md": `# NekoScope

A fast, calm desktop **Markdown viewer**. Double-click a \`.md\` file and it
opens here instantly.

> Tip: drag a Markdown file onto this window, or press the folder button to
> browse a whole project.

## What it renders

- GitHub-Flavored Markdown: tables, task lists, ~~strikethrough~~, footnotes
- Math with KaTeX, e.g. $E = mc^2$ and $\\int_0^1 x^2\\,dx = \\tfrac13$
- Mermaid diagrams, syntax-highlighted code, and a live outline

### Task list

- [x] Open a file from the desktop
- [x] Read it with a clean layout
- [ ] Star the repo

### Table

| Shortcut | Action |
| --- | --- |
| \`Ctrl/Cmd + P\` | Quick switch file |
| \`Ctrl/Cmd + F\` | Search in folder |
| \`Ctrl/Cmd + K\` | Command palette |
| \`Ctrl/Cmd + J\` | Toggle light / dark |

## Diagram

\`\`\`mermaid
flowchart LR
  File[".md file"] --> Open[Double-click]
  Open --> NekoScope
  NekoScope --> Read[Rendered view]
  NekoScope --> Outline
\`\`\`

## Code

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

See the [keyboard reference](docs/shortcuts.md) for the full list.
`,
  "docs/shortcuts.md": `# Keyboard shortcuts

| Keys | Action |
| --- | --- |
| \`Ctrl/Cmd + O\` | Open file |
| \`Ctrl/Cmd + Shift + O\` | Open folder |
| \`Ctrl/Cmd + P\` | Quick switch file |
| \`Ctrl/Cmd + F\` | Search in folder |
| \`Ctrl/Cmd + K\` | Command palette |
| \`Ctrl/Cmd + E\` | Cycle rendered / source / split |
| \`Ctrl/Cmd + I\` | Toggle outline |
| \`Ctrl/Cmd + B\` | Toggle file sidebar |
| \`Ctrl/Cmd + J\` | Toggle light / dark |
| \`Ctrl/Cmd + Shift + Z\` | Zen mode |
| \`Esc\` | Close dialog / leave Zen |
`,
  "docs/markdown-tour.md": `# Markdown tour

## Blockquote

> Markdown should be pleasant to read even before it is rendered.

## Nested lists

1. First
   - nested item
   - another
2. Second

## Inline code and links

Use \`detectDocumentKind\` to classify files, and read more in
[the README](../README.md).
`,
};

export const demoWorkspace: WorkspaceSummary = {
  path: "sample",
  name: "sample",
  fileCount: Object.keys(files).length,
  markdownCount: Object.keys(files).length,
  configCount: 0,
  gitBranch: null,
};

export const demoTree: FileTreeEntry[] = Object.keys(files).map((path) => ({
  path,
  name: path.split("/").pop() ?? path,
  kind: detectDocumentKind(path, files[path]),
  isDir: false,
  size: files[path].length,
  modifiedMs: null,
}));

export function readDemoFile(path: string): FilePayload {
  const content = files[path] ?? files["README.md"];
  const resolved = files[path] ? path : "README.md";
  return {
    path: resolved,
    name: resolved.split("/").pop() ?? resolved,
    kind: detectDocumentKind(resolved, content),
    content,
    size: content.length,
  };
}
