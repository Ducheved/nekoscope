use std::{io, path::PathBuf};

#[derive(Debug, thiserror::Error)]
pub enum NekoError {
    #[error("Workspace path is not accessible: {0}")]
    WorkspaceUnavailable(PathBuf),
    #[error("Path escapes the selected workspace: {0}")]
    PathEscapesWorkspace(PathBuf),
    #[error("Unsupported document format for this operation")]
    UnsupportedFormat,
    #[error("Document parse error: {0}")]
    Parse(String),
    #[error("Provider profile is missing a base URL or model")]
    ProviderNotConfigured,
    #[error("The selected command is not allowed")]
    CommandNotAllowed,
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),
    #[error("Open error: {0}")]
    Open(String),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("YAML error: {0}")]
    Yaml(#[from] serde_yaml::Error),
    #[error("TOML error: {0}")]
    Toml(String),
    #[error("Watcher error: {0}")]
    Watcher(String),
}

pub type NekoResult<T> = Result<T, NekoError>;
