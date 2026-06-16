pub mod commands;
pub mod domain;

use domain::watcher::WatcherRegistry;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(WatcherRegistry::default())
        .invoke_handler(tauri::generate_handler![
            commands::open_workspace,
            commands::list_workspace_tree,
            commands::read_workspace_file,
            commands::write_workspace_file,
            commands::watch_workspace,
            commands::search_workspace,
            commands::build_link_graph,
            commands::detect_document_kind,
            commands::format_document,
            commands::extract_devops_summary,
            commands::extract_ml_summary,
            commands::load_comments,
            commands::save_comment,
            commands::resolve_comment,
            commands::ask_ai_stream,
            commands::save_provider_profile,
            commands::test_provider_profile,
            commands::save_sync_profile,
            commands::list_sync_profiles,
            commands::open_in_ide,
            commands::reveal_in_file_manager,
            commands::get_opened_urls,
            commands::register_deep_links
        ])
        .run(tauri::generate_context!())
        .expect("NekoScope runtime failed");
}
