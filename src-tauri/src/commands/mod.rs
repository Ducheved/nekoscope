use tauri::{AppHandle, State};

use crate::domain::{
    external, file_tree,
    models::*,
    os_hooks::{self, LaunchPaths},
    watcher::WatcherRegistry,
};

fn command_error(error: impl ToString) -> String {
    error.to_string()
}

#[tauri::command]
pub fn open_path(path: String) -> Result<OpenResult, String> {
    file_tree::open_path(&path).map_err(command_error)
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
pub fn search_workspace(workspace: String, query: String) -> Result<Vec<SearchResult>, String> {
    file_tree::search_workspace(&workspace, &query).map_err(command_error)
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
pub fn open_url(url: String) -> Result<(), String> {
    external::open_url(&url).map_err(command_error)
}

#[tauri::command]
pub fn open_external(workspace: String, path: String) -> Result<(), String> {
    external::open_workspace_path(&workspace, &path).map_err(command_error)
}

#[tauri::command]
pub fn reveal_in_file_manager(workspace: String, path: String) -> Result<(), String> {
    external::reveal_workspace_path(&workspace, &path).map_err(command_error)
}

#[tauri::command]
pub fn take_launch_paths(state: State<'_, LaunchPaths>) -> Vec<String> {
    os_hooks::take_launch_paths(&state)
}
