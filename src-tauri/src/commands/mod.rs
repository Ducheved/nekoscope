use tauri::{AppHandle, State};

use crate::domain::{
    ai, comments, devops, file_tree, formatters, ide, link_graph, ml, models::*, os_hooks,
    settings, watcher::WatcherRegistry,
};

fn command_error(error: impl ToString) -> String {
    error.to_string()
}

#[tauri::command]
pub fn open_workspace(path: String) -> Result<WorkspaceSummary, String> {
    file_tree::open_workspace(&path).map_err(command_error)
}

#[tauri::command]
pub fn list_workspace_tree(
    path: String,
    include_hidden: Option<bool>,
) -> Result<Vec<FileTreeEntry>, String> {
    file_tree::list_workspace_tree(&path, include_hidden.unwrap_or(false)).map_err(command_error)
}

#[tauri::command]
pub fn read_workspace_file(workspace: String, path: String) -> Result<FilePayload, String> {
    file_tree::read_workspace_file(&workspace, &path).map_err(command_error)
}

#[tauri::command]
pub fn write_workspace_file(
    workspace: String,
    path: String,
    content: String,
) -> Result<FilePayload, String> {
    file_tree::write_workspace_file(&workspace, &path, &content).map_err(command_error)
}

#[tauri::command]
pub fn watch_workspace(
    app: AppHandle,
    watchers: State<'_, WatcherRegistry>,
    path: String,
) -> Result<WatchReceipt, String> {
    file_tree::watch_workspace(app, watchers, &path).map_err(command_error)
}

#[tauri::command]
pub fn search_workspace(workspace: String, query: String) -> Result<Vec<SearchResult>, String> {
    file_tree::search_workspace(&workspace, &query).map_err(command_error)
}

#[tauri::command]
pub fn build_link_graph(workspace: String) -> Result<LinkGraph, String> {
    link_graph::build_link_graph(&workspace).map_err(command_error)
}

#[tauri::command]
pub fn detect_document_kind(path: String, content: Option<String>) -> DocumentKind {
    formatters::detect_document_kind(&path, content.as_deref())
}

#[tauri::command]
pub fn format_document(path: String, content: String) -> Result<FormatResult, String> {
    formatters::format_document(&path, &content).map_err(command_error)
}

#[tauri::command]
pub fn extract_devops_summary(path: String, content: String) -> Result<DevopsSummary, String> {
    devops::extract_devops_summary(&path, &content).map_err(command_error)
}

#[tauri::command]
pub fn extract_ml_summary(path: String, content: String) -> Result<MlSummary, String> {
    ml::extract_ml_summary(&path, &content).map_err(command_error)
}

#[tauri::command]
pub fn load_comments(workspace: String) -> Result<Vec<CommentItem>, String> {
    comments::load_comments(&workspace).map_err(command_error)
}

#[tauri::command]
pub fn save_comment(workspace: String, comment: CommentItem) -> Result<Vec<CommentItem>, String> {
    comments::save_comment(&workspace, comment).map_err(command_error)
}

#[tauri::command]
pub fn resolve_comment(workspace: String, id: String) -> Result<Vec<CommentItem>, String> {
    comments::resolve_comment(&workspace, &id).map_err(command_error)
}

#[tauri::command]
pub fn ask_ai_stream(request: AiRequest) -> Result<AiResponse, String> {
    ai::ask_ai_stream(request).map_err(command_error)
}

#[tauri::command]
pub fn save_provider_profile(profile: ProviderProfile) -> Result<ProviderProfile, String> {
    settings::save_provider_profile(profile).map_err(command_error)
}

#[tauri::command]
pub fn test_provider_profile(profile: ProviderProfile) -> Result<ProviderTestResult, String> {
    ai::test_provider_profile(profile).map_err(command_error)
}

#[tauri::command]
pub fn save_sync_profile(profile: SyncProfile) -> Result<SyncProfile, String> {
    settings::save_sync_profile(profile).map_err(command_error)
}

#[tauri::command]
pub fn list_sync_profiles() -> Result<Vec<SyncProfile>, String> {
    settings::list_sync_profiles().map_err(command_error)
}

#[tauri::command]
pub fn open_in_ide(request: IdeOpenRequest) -> Result<IdeOpenResult, String> {
    ide::open_in_ide(request).map_err(command_error)
}

#[tauri::command]
pub fn reveal_in_file_manager(path: String) -> Result<IdeOpenResult, String> {
    ide::reveal_in_file_manager(&path).map_err(command_error)
}

#[tauri::command]
pub fn get_opened_urls() -> Vec<String> {
    os_hooks::get_opened_urls()
}

#[tauri::command]
pub fn register_deep_links() -> DeepLinkRegistration {
    os_hooks::register_deep_links()
}
