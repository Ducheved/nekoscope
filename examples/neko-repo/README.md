# NekoScope Sample

This workspace exercises Markdown rendering, [architecture notes](docs/architecture.md), inline diagrams, DevOps manifest highlighting, ML metadata and review comments.

## Quick tour

- Browse Markdown, YAML, Terraform and ML files.
- Use Zen mode when you only want to read.
- Open comments and AI as supporting tools instead of permanent sidebars.

## DevOps manifest preview

```kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nekoscope
  namespace: docs
  labels:
    app.kubernetes.io/name: nekoscope
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: app
          image: ghcr.io/ducheved/nekoscope:0.1.0
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
```

## Diagram gallery

```mermaid
sequenceDiagram
  participant Reader
  participant NekoScope
  participant Workspace
  Reader->>NekoScope: Open Markdown file
  NekoScope->>Workspace: Read local context
  Workspace-->>NekoScope: Sanitized content
  NekoScope-->>Reader: Rendered document
```

```mermaid
flowchart LR
  Markdown --> Rendered
  Rendered --> Diagrams
  Rendered --> Code
  Code --> Review
```

```mermaid
stateDiagram-v2
  [*] --> Browsing
  Browsing --> Zen: open reader
  Browsing --> Review: add comment
  Review --> Browsing
  Zen --> Browsing: Esc
```

```mermaid
erDiagram
  WORKSPACE ||--o{ FILE : contains
  FILE ||--o{ COMMENT : has
  FILE ||--o{ DIAGRAM : renders
```

```mermaid
gantt
  title Release lane
  dateFormat  YYYY-MM-DD
  section Build
  Verify       :done, 2026-06-16, 1d
  Package      :active, 2026-06-17, 1d
  Publish      :2026-06-18, 1d
```

```mermaid
pie title File mix
  "Markdown" : 3
  "YAML" : 2
  "JSON" : 2
```

| Area      | Renderer          | Status      |
| --------- | ----------------- | ----------- |
| Markdown  | GFM + math        | stable      |
| Mermaid   | inline SVG        | themed      |
| Manifests | DevOps-aware code | highlighted |
