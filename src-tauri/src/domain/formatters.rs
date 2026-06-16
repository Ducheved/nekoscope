use crate::domain::{
    errors::{NekoError, NekoResult},
    models::{DocumentKind, FormatResult},
};

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
    } else {
        DocumentKind::Text
    }
}

pub fn looks_like_json(content: Option<&str>) -> bool {
    content
        .map(str::trim_start)
        .map(|value| value.starts_with('{') || value.starts_with('['))
        .unwrap_or(false)
}

pub fn is_one_line_json(content: &str) -> bool {
    let trimmed = content.trim();
    trimmed.len() > 160
        && !trimmed.contains('\n')
        && serde_json::from_str::<serde_json::Value>(trimmed).is_ok()
}

pub fn format_document(path: &str, content: &str) -> NekoResult<FormatResult> {
    let kind = detect_document_kind(path, Some(content));
    let formatted = match kind {
        DocumentKind::Json => {
            let parsed: serde_json::Value = serde_json::from_str(content)?;
            format!("{}\n", serde_json::to_string_pretty(&parsed)?)
        }
        DocumentKind::Yaml => {
            let parsed: serde_yaml::Value = serde_yaml::from_str(content)?;
            serde_yaml::to_string(&parsed)?
        }
        DocumentKind::Toml => {
            let parsed = content
                .parse::<toml::Value>()
                .map_err(|error| NekoError::Toml(error.to_string()))?;
            format!(
                "{}\n",
                toml::to_string_pretty(&parsed)
                    .map_err(|error| NekoError::Toml(error.to_string()))?
            )
        }
        DocumentKind::Markdown | DocumentKind::Text => {
            let trimmed = content.trim_end();
            format!("{trimmed}\n")
        }
        _ => return Err(NekoError::UnsupportedFormat),
    };
    Ok(FormatResult {
        path: path.to_string(),
        kind,
        changed: formatted != content,
        formatted,
    })
}
