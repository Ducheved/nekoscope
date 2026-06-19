# Changelog

## 0.1.1

- Tauri 2 + SvelteKit foundation for a fast, calm desktop Markdown viewer.
- Open a `.md` file straight from the desktop: file association, "Open with",
  drag-and-drop and command-line argument all open the file immediately. A
  single-instance guard focuses the running window for subsequent files.
- Markdown rendering: GitHub-Flavored Markdown, frontmatter, KaTeX math, inline
  Mermaid diagrams themed for light and dark, syntax-highlighted code fences with
  copy buttons.
- Navigation: file sidebar, document outline, quick switcher, command palette,
  full-text folder search with jump-to-line, and in-place relative-link
  navigation.
- Reading comfort: rendered / source / split views, Zen mode, light / dark /
  system theme, adjustable font size, and live reload when a file changes on
  disk.
- Localization in English, Russian, Japanese and Chinese, selected from the
  system locale by default.
- Read-only and offline: path validation, sanitized HTML, no network calls, no
  telemetry.
