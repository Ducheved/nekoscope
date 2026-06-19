use std::fs;

use nekoscope_lib::domain::{file_tree, formatters, models::DocumentKind, os_hooks, security};

#[test]
fn detect_document_kind_flags_binary_extensions() {
    assert_eq!(
        formatters::detect_document_kind("logo.png", None),
        DocumentKind::Binary
    );
    assert_eq!(
        formatters::detect_document_kind("app.exe", None),
        DocumentKind::Binary
    );
    assert_eq!(
        formatters::detect_document_kind("README.md", None),
        DocumentKind::Markdown
    );
}

#[test]
fn open_path_skips_binary_first_file_and_opens_markdown() {
    let workspace = tempfile::tempdir().expect("workspace");
    // Sorts before README.md and holds non-UTF-8 bytes; must be skipped.
    fs::write(
        workspace.path().join("a-image.png"),
        [0xFF, 0xFE, 0x00, 0x01],
    )
    .expect("png");
    fs::write(workspace.path().join("README.md"), "# Readme").expect("readme");
    let result =
        file_tree::open_path(workspace.path().to_str().expect("workspace path")).expect("open");
    assert_eq!(result.active_path.as_deref(), Some("README.md"));
}

#[test]
fn open_path_survives_a_folder_with_only_unreadable_files() {
    let workspace = tempfile::tempdir().expect("workspace");
    // A text-kind file that is not valid UTF-8: reading fails, but the folder
    // must still open (tree available, no active document) rather than error.
    fs::write(workspace.path().join("notes.txt"), [0xFF, 0xFE, 0x00, 0x01]).expect("bad");
    let result =
        file_tree::open_path(workspace.path().to_str().expect("workspace path")).expect("open");
    assert!(result.file.is_none());
    assert!(result.entries.iter().any(|entry| entry.path == "notes.txt"));
}

#[test]
fn safe_path_normalization_blocks_escape() {
    let workspace = tempfile::tempdir().expect("workspace");
    let outside = tempfile::NamedTempFile::new().expect("outside");
    let result = security::resolve_existing_in_workspace(
        workspace.path().to_str().expect("workspace path"),
        outside.path().to_str().expect("outside path"),
    );
    assert!(result.is_err());
}

#[test]
fn hidden_folder_filtering_skips_heavy_paths() {
    let workspace = tempfile::tempdir().expect("workspace");
    fs::create_dir_all(workspace.path().join("node_modules/pkg")).expect("node_modules");
    fs::write(workspace.path().join("README.md"), "# Readme").expect("readme");
    fs::write(
        workspace.path().join("node_modules/pkg/index.md"),
        "# Hidden",
    )
    .expect("hidden");
    let tree =
        file_tree::list_workspace_tree(workspace.path().to_str().expect("workspace path"), false)
            .expect("tree");
    assert!(tree.iter().any(|entry| entry.path == "README.md"));
    assert!(
        tree.iter()
            .all(|entry| !entry.path.contains("node_modules"))
    );
}

#[test]
fn workspace_index_counts_markdown_and_configs() {
    let workspace = tempfile::tempdir().expect("workspace");
    fs::write(workspace.path().join("README.md"), "# Readme").expect("readme");
    fs::write(workspace.path().join("values.yaml"), "kind: ConfigMap").expect("yaml");
    let summary = file_tree::open_workspace(workspace.path().to_str().expect("workspace path"))
        .expect("summary");
    assert_eq!(summary.markdown_count, 1);
    assert_eq!(summary.config_count, 1);
}

#[test]
fn open_path_on_file_uses_parent_folder_as_workspace() {
    let workspace = tempfile::tempdir().expect("workspace");
    fs::write(workspace.path().join("NOTES.md"), "# Notes\n\nHello").expect("notes");
    fs::write(workspace.path().join("sibling.md"), "# Sibling").expect("sibling");
    let file = workspace.path().join("NOTES.md");
    let result = file_tree::open_path(file.to_str().expect("file path")).expect("open");
    assert_eq!(result.active_path.as_deref(), Some("NOTES.md"));
    let opened = result.file.expect("file payload");
    assert_eq!(opened.path, "NOTES.md");
    assert!(opened.content.contains("# Notes"));
    // The sidebar should show the sibling document from the parent folder.
    assert!(
        result
            .entries
            .iter()
            .any(|entry| entry.path == "sibling.md")
    );
}

#[test]
fn open_path_on_directory_selects_first_document() {
    let workspace = tempfile::tempdir().expect("workspace");
    fs::write(workspace.path().join("README.md"), "# Readme").expect("readme");
    let result =
        file_tree::open_path(workspace.path().to_str().expect("workspace path")).expect("open");
    assert!(result.file.is_some());
    assert!(result.active_path.is_some());
}

#[test]
fn launch_paths_keep_only_existing_non_flag_arguments() {
    let existing = tempfile::NamedTempFile::new().expect("existing");
    let existing_path = existing.path().to_string_lossy().to_string();
    let args = vec![
        "nekoscope.exe".to_string(),
        "--some-flag".to_string(),
        "C:/definitely/missing/file.md".to_string(),
        existing_path.clone(),
    ];
    let paths = os_hooks::paths_from_args(&args);
    assert_eq!(paths, vec![existing_path]);
}
