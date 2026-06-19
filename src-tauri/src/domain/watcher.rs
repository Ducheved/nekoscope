use std::{collections::HashMap, sync::Mutex};

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter, State};

use crate::domain::{
    errors::{NekoError, NekoResult},
    models::WatchReceipt,
    security,
};

#[derive(Default)]
pub struct WatcherRegistry {
    watchers: Mutex<HashMap<String, RecommendedWatcher>>,
}

pub fn register_workspace(
    app: AppHandle,
    registry: State<'_, WatcherRegistry>,
    path: &str,
) -> NekoResult<WatchReceipt> {
    let root = security::normalize_workspace(path)?;
    let key = root.to_string_lossy().to_string();
    let event_key = key.clone();
    let mut watcher = notify::recommended_watcher(move |result: notify::Result<notify::Event>| {
        if let Ok(event) = result {
            let paths: Vec<String> = event
                .paths
                .iter()
                .map(|path| path.to_string_lossy().to_string())
                .collect();
            let _ = app.emit(
                "workspace-changed",
                serde_json::json!({
                    "workspace": event_key,
                    "paths": paths,
                    "kind": format!("{:?}", event.kind)
                }),
            );
        }
    })
    .map_err(|error| NekoError::Watcher(error.to_string()))?;
    watcher
        .watch(root.as_path(), RecursiveMode::Recursive)
        .map_err(|error| NekoError::Watcher(error.to_string()))?;
    let mut watchers = registry
        .watchers
        .lock()
        .map_err(|error| NekoError::Watcher(error.to_string()))?;
    watchers.clear();
    watchers.insert(key.clone(), watcher);
    drop(watchers);
    Ok(WatchReceipt {
        path: key,
        recursive: true,
        debounced_ms: 250,
    })
}
