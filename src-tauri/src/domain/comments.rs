use std::{
    fs,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::domain::{errors::NekoResult, models::CommentItem, security};

pub fn load_comments(workspace: &str) -> NekoResult<Vec<CommentItem>> {
    let path = comments_path(workspace)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

pub fn save_comment(workspace: &str, mut comment: CommentItem) -> NekoResult<Vec<CommentItem>> {
    let mut comments = load_comments(workspace)?;
    if comment.id.trim().is_empty() {
        comment.id = format!("comment-{}", now_ms());
    }
    if comment.created_at.trim().is_empty() {
        comment.created_at = now_ms().to_string();
    }
    if comment.state.trim().is_empty() {
        comment.state = "open".to_string();
    }
    if let Some(existing) = comments.iter_mut().find(|item| item.id == comment.id) {
        *existing = comment;
    } else {
        comments.push(comment);
    }
    write_comments(workspace, &comments)?;
    Ok(comments)
}

pub fn resolve_comment(workspace: &str, id: &str) -> NekoResult<Vec<CommentItem>> {
    let mut comments = load_comments(workspace)?;
    for comment in &mut comments {
        if comment.id == id {
            comment.state = "resolved".to_string();
        }
    }
    write_comments(workspace, &comments)?;
    Ok(comments)
}

fn write_comments(workspace: &str, comments: &[CommentItem]) -> NekoResult<()> {
    let path = comments_path(workspace)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, serde_json::to_string_pretty(comments)?)?;
    Ok(())
}

fn comments_path(workspace: &str) -> NekoResult<std::path::PathBuf> {
    let root = security::normalize_workspace(workspace)?;
    Ok(root.join(".nekoscope").join("comments.json"))
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}
