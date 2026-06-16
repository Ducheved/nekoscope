import { detectDocumentKind } from "./formatters";
import type { FilePayload, FileTreeEntry, WorkspaceSummary } from "./types";

const files: Record<string, string> = {
  "README.md": `# NekoScope Sample

This workspace shows Markdown rendering, [[docs/architecture]], DevOps summaries, ML cards and review comments.

## Quick tour

- Open docs from the left tree.
- Toggle the mindmap panel.
- Inspect Kubernetes and metrics metadata.

\`\`\`mermaid
mindmap
  root((NekoScope))
    Markdown
    Diagrams
    DevOps
    ML
\`\`\`
`,
  "docs/architecture.md": `# Architecture

## Desktop shell

Tauri hosts a Rust command layer and a Svelte glass UI.

## Renderer registry

\`\`\`mermaid
flowchart LR
  File --> Markdown
  Markdown --> Mindmap
  Markdown --> Mermaid
\`\`\`
`,
  "docs/adr/0001-record-architecture-decisions.md": `# Record Architecture Decisions

status: accepted
date: 2026-06-16

## Context

Markdown-heavy repositories need navigable architecture memory.

## Decision

Store ADRs as Markdown and index headings, links and backlinks.

## Consequences

The repo knowledge map can show decisions next to diagrams.
`,
  "k8s/deployment.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nekoscope
  namespace: docs
spec:
  template:
    spec:
      containers:
        - name: app
          image: nekoscope:0.1.0
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
`,
  ".github/workflows/ci.yml": `name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`,
  "ml/metrics.json": `{"accuracy":0.94,"loss":0.18,"f1":0.91}`,
  "data/config-one-line.json": `{"provider":"local","features":["markdown","mindmap","sync"],"nested":{"safe":true,"count":3},"thresholds":{"openMs":300,"coldStartMs":1500}}`,
};

export const demoWorkspace: WorkspaceSummary = {
  path: "examples/neko-repo",
  name: "neko-repo",
  fileCount: Object.keys(files).length,
  markdownCount: 3,
  configCount: 3,
  gitBranch: "main",
};

export const demoTree: FileTreeEntry[] = Object.keys(files).map((path) => ({
  path,
  name: path.split("/").pop() ?? path,
  kind: detectDocumentKind(path, files[path]),
  isDir: false,
  size: files[path].length,
  modifiedMs: Date.now(),
}));

export function readDemoFile(path: string): FilePayload {
  const content = files[path] ?? files["README.md"];
  return {
    path,
    name: path.split("/").pop() ?? path,
    kind: detectDocumentKind(path, content),
    content,
    size: content.length,
  };
}
