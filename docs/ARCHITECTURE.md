# Architecture

NekoScope is split into a Svelte UI, a Rust/Tauri command boundary and small domain modules that can be tested without launching a desktop window.

## Desktop Shell

The frontend lives in `src/` and uses SvelteKit in SPA mode with Tauri 2 serving the built static files. The main screen is `WorkspaceShell`, which coordinates file navigation, tabs, renderer state, comments, provider settings, sync profiles and command routing.

## Rust Boundary

Rust code lives in `src-tauri/src/domain` and exposes commands through `src-tauri/src/commands`. The backend owns workspace path validation, filesystem traversal, file reads and writes, watcher registration, comments sidecar persistence, safe provider profile persistence and IDE escalation.

## Renderer Registry

The frontend renderer registry is intentionally small:

- `markdownLens` renders sanitized Markdown and extracts outline, wikilinks and document stats.
- `mindmapAdapters` converts Markdown, Mermaid mindmap, JSON, YAML, OPML and FreeMind source into an internal tree.
- `diagramGarden` extracts diagram fences and renders zoomable SVG previews.
- `formatters` owns preview formatting and never writes without explicit user action.

## AI Bridge

The AI bridge builds redacted request previews from the active provider profile and selected context. Provider secrets are removed before persistence and redacted before request shaping. The current base profile is local-first through Ollama.

## Security Boundaries

The Rust `security` module canonicalizes paths and rejects access outside the selected workspace. Markdown rendering uses sanitize-by-default output. External binary and shell operations are routed only through allowlisted commands or user-configured IDE templates.
