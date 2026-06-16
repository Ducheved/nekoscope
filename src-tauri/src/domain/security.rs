use std::{
    fs,
    path::{Path, PathBuf},
};

use crate::domain::errors::{NekoError, NekoResult};

pub fn normalize_workspace(path: &str) -> NekoResult<PathBuf> {
    let canonical = fs::canonicalize(path)?;
    if canonical.is_dir() {
        Ok(canonical)
    } else {
        Err(NekoError::WorkspaceUnavailable(canonical))
    }
}

pub fn resolve_existing_in_workspace(workspace: &str, path: &str) -> NekoResult<PathBuf> {
    let root = normalize_workspace(workspace)?;
    let candidate = if Path::new(path).is_absolute() {
        PathBuf::from(path)
    } else {
        root.join(path)
    };
    let canonical = fs::canonicalize(&candidate)?;
    if canonical.starts_with(&root) {
        Ok(canonical)
    } else {
        Err(NekoError::PathEscapesWorkspace(candidate))
    }
}

pub fn resolve_writable_in_workspace(workspace: &str, path: &str) -> NekoResult<PathBuf> {
    let root = normalize_workspace(workspace)?;
    let candidate = if Path::new(path).is_absolute() {
        PathBuf::from(path)
    } else {
        root.join(path)
    };
    let parent = candidate
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| root.clone());
    let canonical_parent = fs::canonicalize(parent)?;
    if canonical_parent.starts_with(&root) {
        Ok(candidate)
    } else {
        Err(NekoError::PathEscapesWorkspace(candidate))
    }
}

pub fn relative_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

pub fn is_heavy_or_hidden(name: &str, include_hidden: bool) -> bool {
    let heavy = [
        ".git",
        "node_modules",
        "target",
        "dist",
        "build",
        ".venv",
        "venv",
        ".mypy_cache",
        ".pytest_cache",
        ".ruff_cache",
        ".terraform",
        ".idea",
        ".vscode",
        ".DS_Store",
    ];
    heavy.contains(&name) || (!include_hidden && name.starts_with('.'))
}
