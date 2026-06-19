use std::path::PathBuf;

use crate::domain::{
    errors::{NekoError, NekoResult},
    security,
};

pub fn open_url(url: &str) -> NekoResult<()> {
    opener::open(url).map_err(|error| NekoError::Open(error.to_string()))
}

pub fn open_workspace_path(workspace: &str, path: &str) -> NekoResult<()> {
    let target = security::resolve_existing_in_workspace(workspace, path)?;
    opener::open(strip_verbatim(target)).map_err(|error| NekoError::Open(error.to_string()))
}

pub fn reveal_workspace_path(workspace: &str, path: &str) -> NekoResult<()> {
    let target = security::resolve_existing_in_workspace(workspace, path)?;
    opener::reveal(strip_verbatim(target)).map_err(|error| NekoError::Open(error.to_string()))
}

fn strip_verbatim(path: PathBuf) -> PathBuf {
    let value = path.to_string_lossy();
    if let Some(rest) = value.strip_prefix(r"\\?\UNC\") {
        return PathBuf::from(format!(r"\\{rest}"));
    }
    if let Some(rest) = value.strip_prefix(r"\\?\") {
        return PathBuf::from(rest);
    }
    path
}
