use std::{
    fs,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

use ignore::WalkBuilder;
use tauri::{AppHandle, State};
use walkdir::WalkDir;

use crate::domain::{
    errors::{NekoError, NekoResult},
    formatters::detect_document_kind,
    models::{
        DocumentKind, FilePayload, FileTreeEntry, OpenResult, SearchResult, WatchReceipt,
        WorkspaceSummary,
    },
    security, watcher,
    watcher::WatcherRegistry,
};

pub fn open_path(path: &str) -> NekoResult<OpenResult> {
    let canonical = fs::canonicalize(path)?;
    if canonical.is_dir() {
        let dir = canonical.to_string_lossy().to_string();
        let workspace = open_workspace(&dir)?;
        let entries = list_workspace_tree(&workspace.path, false)?;
        let file = entries
            .iter()
            .filter(|entry| !entry.is_dir && entry.kind == DocumentKind::Markdown)
            .find_map(|entry| read_workspace_file(&workspace.path, &entry.path).ok())
            .or_else(|| {
                entries
                    .iter()
                    .filter(|entry| !entry.is_dir && entry.kind != DocumentKind::Binary)
                    .find_map(|entry| read_workspace_file(&workspace.path, &entry.path).ok())
            });
        let active_path = file.as_ref().map(|file| file.path.clone());
        Ok(OpenResult {
            workspace,
            entries,
            file,
            active_path,
        })
    } else {
        let parent = canonical
            .parent()
            .map(Path::to_path_buf)
            .ok_or_else(|| NekoError::WorkspaceUnavailable(canonical.clone()))?;
        let workspace = open_workspace(&parent.to_string_lossy())?;
        let entries = list_workspace_tree(&workspace.path, false)?;
        let file = read_workspace_file(&workspace.path, &canonical.to_string_lossy())?;
        let active_path = Some(file.path.clone());
        Ok(OpenResult {
            workspace,
            entries,
            file: Some(file),
            active_path,
        })
    }
}

pub fn open_workspace(path: &str) -> NekoResult<WorkspaceSummary> {
    let root = security::normalize_workspace(path)?;
    let mut file_count = 0;
    let mut markdown_count = 0;
    let mut config_count = 0;
    for entry in WalkDir::new(&root)
        .max_depth(6)
        .into_iter()
        .filter_map(Result::ok)
    {
        if entry.file_type().is_file() {
            let name = entry.file_name().to_string_lossy();
            if security::is_heavy_or_hidden(&name, false) {
                continue;
            }
            file_count += 1;
            let relative = security::relative_path(&root, entry.path());
            let kind = detect_document_kind(&relative, None);
            if matches!(kind, DocumentKind::Markdown) {
                markdown_count += 1;
            }
            if matches!(
                kind,
                DocumentKind::Json
                    | DocumentKind::Jsonc
                    | DocumentKind::Yaml
                    | DocumentKind::Toml
                    | DocumentKind::Terraform
                    | DocumentKind::Dockerfile
            ) {
                config_count += 1;
            }
        }
    }
    let name = root
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| "workspace".to_string());
    Ok(WorkspaceSummary {
        path: root.to_string_lossy().to_string(),
        name,
        file_count,
        markdown_count,
        config_count,
        git_branch: git_branch(&root),
    })
}

pub fn list_workspace_tree(path: &str, include_hidden: bool) -> NekoResult<Vec<FileTreeEntry>> {
    let root = security::normalize_workspace(path)?;
    let mut entries = Vec::new();
    let mut builder = WalkBuilder::new(&root);
    let filter_root = root.clone();
    builder
        .hidden(!include_hidden)
        .git_ignore(true)
        .git_exclude(true)
        .parents(true)
        .filter_entry(move |entry| {
            entry.path() == filter_root
                || !security::is_heavy_or_hidden(
                    &entry.file_name().to_string_lossy(),
                    include_hidden,
                )
        });
    for item in builder.build().filter_map(Result::ok) {
        let item_path = item.path();
        if item_path == root {
            continue;
        }
        let name = item.file_name().to_string_lossy().to_string();
        if security::is_heavy_or_hidden(&name, include_hidden) {
            continue;
        }
        let metadata = match item.metadata() {
            Ok(value) => value,
            Err(_) => continue,
        };
        let relative = security::relative_path(&root, item_path);
        entries.push(FileTreeEntry {
            path: relative.clone(),
            name,
            kind: if metadata.is_dir() {
                DocumentKind::Text
            } else {
                detect_document_kind(&relative, None)
            },
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified_ms: metadata.modified().ok().and_then(system_time_ms),
        });
    }
    entries.sort_by(|left, right| {
        (left.is_dir, left.path.as_str()).cmp(&(right.is_dir, right.path.as_str()))
    });
    Ok(entries)
}

pub fn read_workspace_file(workspace: &str, path: &str) -> NekoResult<FilePayload> {
    let root = security::normalize_workspace(workspace)?;
    let full_path = security::resolve_existing_in_workspace(workspace, path)?;
    let metadata = fs::metadata(&full_path)?;
    let content = fs::read_to_string(&full_path)?;
    let relative = security::relative_path(&root, &full_path);
    let name = full_path
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| relative.clone());
    Ok(FilePayload {
        path: relative.clone(),
        name,
        kind: detect_document_kind(&relative, Some(&content)),
        content,
        size: metadata.len(),
    })
}

pub fn watch_workspace(
    app: AppHandle,
    watchers: State<'_, WatcherRegistry>,
    path: &str,
) -> NekoResult<WatchReceipt> {
    watcher::register_workspace(app, watchers, path)
}

pub fn search_workspace(workspace: &str, query: &str) -> NekoResult<Vec<SearchResult>> {
    let root = security::normalize_workspace(workspace)?;
    let needle = query.to_ascii_lowercase();
    let mut results = Vec::new();
    if needle.trim().is_empty() {
        return Ok(results);
    }
    for entry in WalkBuilder::new(&root)
        .hidden(true)
        .git_ignore(true)
        .build()
        .filter_map(Result::ok)
    {
        if !entry
            .file_type()
            .map(|kind| kind.is_file())
            .unwrap_or(false)
        {
            continue;
        }
        let relative = security::relative_path(&root, entry.path());
        if matches!(detect_document_kind(&relative, None), DocumentKind::Binary) {
            continue;
        }
        let Ok(content) = fs::read_to_string(entry.path()) else {
            continue;
        };
        for (index, line) in content.lines().enumerate() {
            if line.to_ascii_lowercase().contains(&needle) {
                results.push(SearchResult {
                    path: relative.clone(),
                    line: index + 1,
                    excerpt: line.trim().chars().take(240).collect(),
                });
                if results.len() >= 200 {
                    return Ok(results);
                }
            }
        }
    }
    Ok(results)
}

fn system_time_ms(value: SystemTime) -> Option<u128> {
    value
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|duration| duration.as_millis())
}

fn git_branch(root: &Path) -> Option<String> {
    let head = root.join(".git").join("HEAD");
    let content = fs::read_to_string(head).ok()?;
    content
        .trim()
        .strip_prefix("ref: refs/heads/")
        .map(ToString::to_string)
}
