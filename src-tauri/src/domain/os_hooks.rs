use std::{path::Path, sync::Mutex};

#[derive(Default)]
pub struct LaunchPaths(pub Mutex<Vec<String>>);

pub fn paths_from_args(args: &[String]) -> Vec<String> {
    args.iter()
        .skip(1)
        .filter(|value| !value.starts_with('-'))
        .filter(|value| Path::new(value).exists())
        .cloned()
        .collect()
}

pub fn store_launch_paths(state: &LaunchPaths, paths: Vec<String>) {
    if let Ok(mut guard) = state.0.lock() {
        *guard = paths;
    }
}

pub fn take_launch_paths(state: &LaunchPaths) -> Vec<String> {
    state
        .0
        .lock()
        .map(|mut guard| std::mem::take(&mut *guard))
        .unwrap_or_default()
}
