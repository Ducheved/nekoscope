# NekoScope

[![CI](https://github.com/nekoscope/nekoscope/actions/workflows/ci.yml/badge.svg)](https://github.com/nekoscope/nekoscope/actions/workflows/ci.yml)

A tiny kawaii knowledge lens for Markdown-heavy repos.

NekoScope is a cross-platform Tauri 2 desktop app for engineers who need to open a folder, move quickly through Markdown-heavy documentation, render diagrams, inspect DevOps and ML metadata, add sidecar review comments and prepare redacted AI context without handing the whole repository to a network service by accident.

![NekoScope sample screenshot](assets/screenshots/nekoscope-sample.svg)

## Features

- Three-pane glass desktop shell with file explorer, document viewer and right-side outline, mindmap, diagram, metadata, comments or AI panel.
- Base languages: English, Russian, Japanese and Chinese, with a small `registerLocale` API for adding more.
- Markdown rendering with GFM, frontmatter, math, sanitized HTML, outline extraction, wikilinks and local link graph utilities.
- Diagram workbench with Markdown outline mindmaps, Mermaid mindmap parsing, JSON/YAML/OPML/FreeMind tree adapters, zoom, fit, copy source and SVG export.
- DevOps summaries for Kubernetes, GitHub Actions, Docker Compose and Terraform.
- ML summaries for model cards, metrics JSON and notebooks.
- JSON one-line auto-pretty preview plus explicit Save Formatted flow.
- Sidecar comments stored under `.nekoscope/comments.json` by workspace.
- AI provider profiles for OpenAI-compatible, Anthropic-compatible, Ollama and generic HTTP profiles with redaction and no plaintext API-key persistence.
- Sync profiles for cloud-mounted folders, local folders and network shares.
- IDE escalation through system default, VS Code, Cursor, Sublime Text, Zed or an allowlisted custom command.

## Install

Release bundles are produced by `.github/workflows/release.yml` for macOS, Linux and Windows when a `nekoscope-v*` tag is pushed.

## Build From Source

```sh
pnpm install
pnpm verify
pnpm tauri build
```

The desktop binary does not require Node at runtime.

## Supported Files

Markdown, MDX, text, JSON, JSONC, YAML, TOML, INI, env files, XML, Terraform/HCL, Dockerfile, Docker Compose, GitHub Actions, GitLab CI, Helm values, Kubernetes manifests, MLflow/DVC metadata, notebooks, FreeMind and OPML are recognized by the current viewer and summary layers.

## AI Provider Setup

Open Settings, choose a provider type, set base URL, model, temperature and max tokens, then send a request from the Ask AI panel. Secrets are redacted from prompts and context previews, and API keys are represented as secret-present markers rather than plaintext application settings.

## Privacy Model

NekoScope validates file paths against the selected workspace, sanitizes rendered Markdown, disables remote document fetches by default, stores logs locally, avoids telemetry and redacts `.env`, token, password and private-key patterns before AI context is prepared.

## Keyboard

The command palette and quick switcher expose the core workflow actions. Native shortcuts are wired in the app shell for opening folders, switching files, toggling mindmaps, opening AI context and escalating to an IDE.

## Verification

```sh
pnpm verify
cargo test --manifest-path src-tauri/Cargo.toml
pnpm tauri build
```

## Publication

```sh
bash scripts/publish-github.sh
```

If GitHub authentication is unavailable, set `GH_TOKEN` and rerun the same script.
