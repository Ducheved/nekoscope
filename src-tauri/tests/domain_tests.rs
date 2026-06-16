use std::fs;

use nekoscope_lib::domain::{comments, file_tree, models::CommentItem, security};

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
fn comments_sidecar_persists_and_resolves() {
    let workspace = tempfile::tempdir().expect("workspace");
    let comment = CommentItem {
        id: "c1".to_string(),
        path: "README.md".to_string(),
        anchor: "file".to_string(),
        text: "Review note".to_string(),
        state: "open".to_string(),
        created_at: "1".to_string(),
    };
    let saved = comments::save_comment(workspace.path().to_str().expect("workspace path"), comment)
        .expect("save");
    assert_eq!(saved.len(), 1);
    let resolved =
        comments::resolve_comment(workspace.path().to_str().expect("workspace path"), "c1")
            .expect("resolve");
    assert_eq!(resolved[0].state, "resolved");
}
