use crate::domain::models::DocumentKind;

pub fn detect_document_kind(path: &str, content: Option<&str>) -> DocumentKind {
    let lower = path.to_ascii_lowercase();
    if lower.ends_with(".md") || lower.ends_with(".markdown") || lower.ends_with(".mdx") {
        DocumentKind::Markdown
    } else if lower.ends_with(".json") || looks_like_json(content) {
        DocumentKind::Json
    } else if lower.ends_with(".jsonc") {
        DocumentKind::Jsonc
    } else if lower.ends_with(".yaml") || lower.ends_with(".yml") {
        DocumentKind::Yaml
    } else if lower.ends_with(".toml") {
        DocumentKind::Toml
    } else if lower.ends_with(".env") {
        DocumentKind::Env
    } else if lower.ends_with(".xml") {
        DocumentKind::Xml
    } else if lower.ends_with(".tf") || lower.ends_with(".tfvars") || lower.ends_with(".hcl") {
        DocumentKind::Terraform
    } else if lower.ends_with("dockerfile") || lower.ends_with("/dockerfile") {
        DocumentKind::Dockerfile
    } else if lower.ends_with(".ipynb") {
        DocumentKind::Notebook
    } else if lower.ends_with(".mm") {
        DocumentKind::Mindmap
    } else if lower.ends_with(".opml") {
        DocumentKind::Opml
    } else if is_binary_extension(&lower) {
        DocumentKind::Binary
    } else {
        DocumentKind::Text
    }
}

fn is_binary_extension(lower: &str) -> bool {
    const BINARY: &[&str] = &[
        ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".tif", ".tiff", ".avif", ".pdf",
        ".zip", ".gz", ".tgz", ".tar", ".7z", ".rar", ".bz2", ".xz", ".zst", ".mp3", ".mp4",
        ".mov", ".avi", ".mkv", ".webm", ".wav", ".flac", ".ogg", ".m4a", ".woff", ".woff2",
        ".ttf", ".otf", ".eot", ".exe", ".dll", ".so", ".dylib", ".bin", ".class", ".jar", ".wasm",
        ".node", ".pdb", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp",
        ".db", ".sqlite", ".sqlite3", ".pyc",
    ];
    BINARY.iter().any(|ext| lower.ends_with(ext))
}

pub fn looks_like_json(content: Option<&str>) -> bool {
    content
        .map(str::trim_start)
        .map(|value| value.starts_with('{') || value.starts_with('['))
        .unwrap_or(false)
}
