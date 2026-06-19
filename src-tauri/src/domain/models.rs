use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum DocumentKind {
    Markdown,
    Json,
    Jsonc,
    Yaml,
    Toml,
    Env,
    Xml,
    Terraform,
    Dockerfile,
    Notebook,
    Mindmap,
    Opml,
    Text,
    Binary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSummary {
    pub path: String,
    pub name: String,
    pub file_count: usize,
    pub markdown_count: usize,
    pub config_count: usize,
    pub git_branch: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTreeEntry {
    pub path: String,
    pub name: String,
    pub kind: DocumentKind,
    pub is_dir: bool,
    pub size: u64,
    pub modified_ms: Option<u128>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilePayload {
    pub path: String,
    pub name: String,
    pub kind: DocumentKind,
    pub content: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub path: String,
    pub line: usize,
    pub excerpt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchReceipt {
    pub path: String,
    pub recursive: bool,
    pub debounced_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenResult {
    pub workspace: WorkspaceSummary,
    pub entries: Vec<FileTreeEntry>,
    pub file: Option<FilePayload>,
    pub active_path: Option<String>,
}
