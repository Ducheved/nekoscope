# Contributing

NekoScope contributors keep changes small, tested and local-first.

## Development

```sh
pnpm install
pnpm tauri:dev
```

## Quality Gates

```sh
pnpm verify
pnpm tauri build
```

## Code Style

Source code, scripts, workflows and tests should be self-explanatory through names, structure and coverage. Documentation belongs in Markdown files.

## Privacy

Do not commit secrets, local logs, agent workspace files or generated session metadata.
