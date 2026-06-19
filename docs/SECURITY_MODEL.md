# Security Model

NekoScope is a local-first, read-only Markdown viewer.

## File access scope

All Rust filesystem commands canonicalize the open folder and reject paths that
escape it. When a single file is opened, its parent folder becomes the scope.
Symlinks that resolve outside the folder are rejected by the canonical-path
check.

## Read-only

The app reads files; it has no command that writes to the documents it displays.
The only outward actions are opening a file with the OS default handler and
revealing it in the file manager.

## Markdown sanitization

Markdown is rendered through a `unified` pipeline with `rehype-sanitize`, so
rendered documents cannot inject scripts or unsafe HTML. Code fences and Mermaid
diagrams are rendered as text/SVG and never executed as code.

## Network

The app makes no network requests. The Content-Security-Policy restricts
`connect-src`, `script-src` and `img-src` to local sources, and there is no
remote document fetching.

## Telemetry

No telemetry, analytics or crash upload is configured.
