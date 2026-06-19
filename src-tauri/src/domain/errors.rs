use std::{io, path::PathBuf};

#[derive(Debug, thiserror::Error)]
pub enum NekoError {
    #[error("Path is not accessible: {0}")]
    WorkspaceUnavailable(PathBuf),
    #[error("Path escapes the open folder: {0}")]
    PathEscapesWorkspace(PathBuf),
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),
    #[error("Open error: {0}")]
    Open(String),
    #[error("Watcher error: {0}")]
    Watcher(String),
}

pub type NekoResult<T> = Result<T, NekoError>;
