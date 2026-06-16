use serde_json::Value;

use crate::domain::{
    errors::NekoResult,
    models::{MetricValue, MlSummary},
};

pub fn extract_ml_summary(path: &str, content: &str) -> NekoResult<MlSummary> {
    let lower = path.to_ascii_lowercase();
    if lower.ends_with("metrics.json") {
        metrics_summary(content)
    } else if lower.ends_with(".ipynb") {
        notebook_summary(content)
    } else if lower.ends_with("model_card.md") || lower.ends_with("dataset_card.md") {
        Ok(card_summary(path, content))
    } else {
        Ok(MlSummary {
            document_type: "ml-signal".to_string(),
            title: None,
            metrics: Vec::new(),
            signals: discover_entrypoints(content),
        })
    }
}

fn metrics_summary(content: &str) -> NekoResult<MlSummary> {
    let value: Value = serde_json::from_str(content)?;
    let mut metrics = Vec::new();
    if let Value::Object(map) = value {
        for (name, value) in map {
            if value.is_number() || value.is_string() || value.is_boolean() {
                metrics.push(MetricValue {
                    name,
                    value: value.to_string(),
                });
            }
        }
    }
    Ok(MlSummary {
        document_type: "metrics".to_string(),
        title: Some("Metrics".to_string()),
        metrics,
        signals: Vec::new(),
    })
}

fn notebook_summary(content: &str) -> NekoResult<MlSummary> {
    let value: Value = serde_json::from_str(content)?;
    let cells = value
        .get("cells")
        .and_then(Value::as_array)
        .map(Vec::len)
        .unwrap_or(0);
    Ok(MlSummary {
        document_type: "notebook".to_string(),
        title: Some("Notebook".to_string()),
        metrics: Vec::new(),
        signals: vec![format!("cells: {cells}")],
    })
}

fn card_summary(path: &str, content: &str) -> MlSummary {
    let title = content
        .lines()
        .find_map(|line| line.strip_prefix("# "))
        .map(str::to_string);
    MlSummary {
        document_type: if path.to_ascii_lowercase().contains("dataset") {
            "dataset-card".to_string()
        } else {
            "model-card".to_string()
        },
        title,
        metrics: Vec::new(),
        signals: discover_entrypoints(content),
    }
}

fn discover_entrypoints(content: &str) -> Vec<String> {
    ["train.py", "predict.py", "inference.py", "serve.py"]
        .iter()
        .filter(|name| content.contains(**name))
        .map(|name| format!("entrypoint: {name}"))
        .collect()
}
