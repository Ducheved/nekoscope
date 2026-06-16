use serde_yaml::Value;

use crate::domain::{errors::NekoResult, models::DevopsSummary};

pub fn extract_devops_summary(path: &str, content: &str) -> NekoResult<DevopsSummary> {
    let lower = path.to_ascii_lowercase();
    if lower.contains(".github/workflows/") {
        github_actions_summary(content)
    } else if lower.ends_with("docker-compose.yml") || lower.ends_with("docker-compose.yaml") {
        docker_compose_summary(content)
    } else if lower.ends_with(".yaml") || lower.ends_with(".yml") {
        kubernetes_summary(content)
    } else if lower.ends_with(".tf") {
        Ok(terraform_summary(content))
    } else {
        Ok(DevopsSummary {
            document_type: "config".to_string(),
            title: None,
            highlights: Vec::new(),
            warnings: Vec::new(),
        })
    }
}

fn kubernetes_summary(content: &str) -> NekoResult<DevopsSummary> {
    let doc: Value = serde_yaml::from_str(content)?;
    let kind = doc
        .get("kind")
        .and_then(Value::as_str)
        .unwrap_or("Kubernetes");
    let name = doc
        .get("metadata")
        .and_then(|metadata| metadata.get("name"))
        .and_then(Value::as_str);
    let namespace = doc
        .get("metadata")
        .and_then(|metadata| metadata.get("namespace"))
        .and_then(Value::as_str)
        .unwrap_or("default");
    let mut highlights = vec![format!("kind: {kind}"), format!("namespace: {namespace}")];
    if let Some(name) = name {
        highlights.push(format!("name: {name}"));
    }
    let mut warnings = Vec::new();
    let content_lower = content.to_ascii_lowercase();
    if content_lower.contains("image:") && content_lower.contains(":latest") {
        warnings.push("image tag latest".to_string());
    }
    if content_lower.contains("privileged: true") {
        warnings.push("privileged container".to_string());
    }
    if !content_lower.contains("resources:") {
        warnings.push("missing resource requests or limits".to_string());
    }
    if content_lower.contains("hostpath:") {
        warnings.push("hostPath volume".to_string());
    }
    if content_lower.contains("password:") || content_lower.contains("token:") {
        warnings.push("secret-looking value appears inline".to_string());
    }
    Ok(DevopsSummary {
        document_type: "kubernetes".to_string(),
        title: name.map(str::to_string),
        highlights,
        warnings,
    })
}

fn github_actions_summary(content: &str) -> NekoResult<DevopsSummary> {
    let doc: Value = serde_yaml::from_str(content)?;
    let title = doc.get("name").and_then(Value::as_str).map(str::to_string);
    let mut highlights = Vec::new();
    if let Some(on) = doc.get("on") {
        highlights.push(format!("triggers: {}", compact_yaml(on)));
    }
    if let Some(jobs) = doc.get("jobs").and_then(Value::as_mapping) {
        highlights.push(format!("jobs: {}", jobs.len()));
    }
    let lower = content.to_ascii_lowercase();
    let mut warnings = Vec::new();
    if lower.contains("contents: write") || lower.contains("permissions: write-all") {
        warnings.push("broad write permissions".to_string());
    }
    if lower.contains("pull_request_target") {
        warnings.push("pull_request_target trigger".to_string());
    }
    if lower.contains("uses: ") && lower.contains("@master") {
        warnings.push("unpinned third-party action".to_string());
    }
    Ok(DevopsSummary {
        document_type: "github-actions".to_string(),
        title,
        highlights,
        warnings,
    })
}

fn docker_compose_summary(content: &str) -> NekoResult<DevopsSummary> {
    let doc: Value = serde_yaml::from_str(content)?;
    let services = doc
        .get("services")
        .and_then(Value::as_mapping)
        .map(|mapping| mapping.len())
        .unwrap_or(0);
    let lower = content.to_ascii_lowercase();
    let mut warnings = Vec::new();
    if lower.contains("privileged: true") {
        warnings.push("privileged service".to_string());
    }
    if lower.contains("restart: always") {
        warnings.push("always restart policy".to_string());
    }
    Ok(DevopsSummary {
        document_type: "docker-compose".to_string(),
        title: None,
        highlights: vec![format!("services: {services}")],
        warnings,
    })
}

fn terraform_summary(content: &str) -> DevopsSummary {
    let resources = content.matches("resource \"").count();
    let modules = content.matches("module \"").count();
    DevopsSummary {
        document_type: "terraform".to_string(),
        title: None,
        highlights: vec![
            format!("resources: {resources}"),
            format!("modules: {modules}"),
        ],
        warnings: Vec::new(),
    }
}

fn compact_yaml(value: &Value) -> String {
    match value {
        Value::Sequence(sequence) => sequence
            .iter()
            .filter_map(Value::as_str)
            .collect::<Vec<_>>()
            .join(", "),
        Value::String(text) => text.clone(),
        Value::Mapping(mapping) => mapping.len().to_string(),
        _ => "configured".to_string(),
    }
}
