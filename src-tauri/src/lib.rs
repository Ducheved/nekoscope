pub mod commands;
pub mod domain;

use tauri::{Emitter, Manager};

use domain::os_hooks::{self, LaunchPaths};
use domain::watcher::WatcherRegistry;

const OPEN_PATH_EVENT: &str = "open-path";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let paths = os_hooks::paths_from_args(&argv);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
            for path in paths {
                let _ = app.emit(OPEN_PATH_EVENT, path);
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(WatcherRegistry::default())
        .manage(LaunchPaths::default())
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let paths = os_hooks::paths_from_args(&args);
            if !paths.is_empty() {
                os_hooks::store_launch_paths(&app.state::<LaunchPaths>(), paths);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_path,
            commands::list_workspace_tree,
            commands::read_workspace_file,
            commands::search_workspace,
            commands::watch_workspace,
            commands::open_url,
            commands::open_external,
            commands::reveal_in_file_manager,
            commands::take_launch_paths
        ])
        .build(tauri::generate_context!())
        .expect("NekoScope runtime failed")
        .run(|_app, _event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Opened { urls } = _event {
                let paths: Vec<String> = urls
                    .iter()
                    .filter_map(|url| url.to_file_path().ok())
                    .map(|path| path.to_string_lossy().to_string())
                    .collect();
                if !paths.is_empty() {
                    os_hooks::store_launch_paths(&_app.state::<LaunchPaths>(), paths.clone());
                    for path in paths {
                        let _ = _app.emit(OPEN_PATH_EVENT, path);
                    }
                }
            }
        });
}
