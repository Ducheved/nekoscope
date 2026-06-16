# Release

NekoScope releases use tags matching `nekoscope-v*`.

## Local Release Check

```sh
pnpm release:local
```

## Signing

Tauri updater signing uses these GitHub Actions secrets when available:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Unsigned bundles are published only as draft release artifacts by the release workflow.

## GitHub Actions

The release workflow installs pnpm, Node LTS, Rust stable and platform-specific Tauri dependencies, runs verification, builds bundles and uploads artifacts to a GitHub Release.

## Platform Notes

Windows produces NSIS/MSI-capable metadata and file associations through Tauri bundle configuration. Linux produces AppImage and deb metadata. macOS builds for Apple Silicon and Intel through the matrix.
