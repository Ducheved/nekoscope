# Security Model

NekoScope is designed for local-first repository inspection.

## File Access Scope

All Rust filesystem commands canonicalize the selected workspace and reject paths that escape it. Symlinks outside the workspace are rejected by canonical path checks unless a future workspace policy explicitly allows them.

## Markdown Sanitization

Markdown is rendered through a unified pipeline with sanitized HTML output. Rendered documents do not execute code blocks or diagram content.

## AI Redaction

Secret-looking values are redacted from prompts and context files before request previews are created. `.env`, password, token, API key and private-key patterns are treated as sensitive by default.

## Shell Restrictions

IDE escalation supports system default opening and allowlisted editor commands. Custom command templates are rejected unless they resolve to an allowlisted executable.

## Secrets Storage

Provider profile persistence does not write plaintext API keys. Stored profiles keep a secret-present marker while the user supplies secret material in the desktop session.

## Telemetry

No telemetry, analytics or crash upload is configured. Logs remain local and must not include secrets.
