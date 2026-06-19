# Architecture

NekoScope is split into a Svelte UI, a Rust/Tauri command boundary and small
domain modules that can be tested without launching a desktop window.

## Desktop shell

The frontend lives in `src/` and uses SvelteKit in SPA mode (`adapter-static`,
`ssr = false`) with Tauri 2 serving the built static files. The single screen is
`WorkspaceShell`, which coordinates file navigation, view mode, the outline,
search, the command palette / quick switcher and keyboard shortcuts.

## Opening files from the operating system

Markdown files are associated with the app in `tauri.conf.json`
(`bundle.fileAssociations`). On Windows and Linux the opened path is delivered as
a command-line argument; on macOS it arrives as a `RunEvent::Opened` event.

- `tauri-plugin-single-instance` ensures a second double-click focuses the
  running window and forwards the new path instead of starting a new process.
- At cold start, `lib.rs` reads the process arguments and stores any real paths
  in the `LaunchPaths` state; the frontend drains them once via
  `take_launch_paths`.
- While running, new paths are emitted to the frontend as an `open-path` event.

The `open_path` command turns a path into everything the UI needs in one trip
(`OpenResult`): when given a file, its parent folder becomes the workspace and
the file is the active document; when given a folder, the first readable document
is opened.

## Rust boundary

Rust code lives in `src-tauri/src/domain` and is exposed through
`src-tauri/src/commands`. The backend owns path validation, filesystem
traversal, file reads, folder search and filesystem watching. It performs no
network I/O and never writes to the documents it displays.

## Renderer

The frontend renderer is intentionally small:

- `markdownLens` renders sanitized Markdown and extracts the outline, heading
  ids and document stats.
- `diagramGarden` renders Mermaid fences to SVG, themed for light and dark.
- `formatters` classifies a path into a `DocumentKind` for icons and source
  highlighting.

## Security boundaries

The Rust `security` module canonicalizes paths and rejects access outside the
open folder. Markdown is rendered with `rehype-sanitize` (sanitize by default).
There are no network requests and no telemetry. Opening a file in an external
editor or revealing it in the file manager goes through the OS default handler
(`opener`).
