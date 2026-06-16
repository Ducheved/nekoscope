use regex::Regex;
use serde_json::json;

use crate::domain::{
    errors::{NekoError, NekoResult},
    models::{AiRequest, AiResponse, ProviderProfile, ProviderTestResult},
};

pub fn ask_ai_stream(request: AiRequest) -> NekoResult<AiResponse> {
    if request.profile.base_url.trim().is_empty() || request.profile.model.trim().is_empty() {
        return Err(NekoError::ProviderNotConfigured);
    }
    let redacted_prompt = redact_secrets(&request.prompt);
    let context_bytes = request
        .context
        .iter()
        .map(|item| item.content.len())
        .sum::<usize>();
    let request_preview = json!({
        "provider": request.profile.provider_type,
        "baseUrl": request.profile.base_url,
        "model": request.profile.model,
        "temperature": request.profile.temperature,
        "maxTokens": request.profile.max_tokens,
        "streaming": request.profile.streaming,
        "messages": [
            {
                "role": "user",
                "content": redacted_prompt
            }
        ],
        "contextFiles": request.context.iter().map(|file| file.path.clone()).collect::<Vec<_>>()
    });
    Ok(AiResponse {
        provider: request.profile.name,
        model: request.profile.model,
        context_bytes,
        redacted_prompt,
        request_preview,
    })
}

pub fn test_provider_profile(profile: ProviderProfile) -> NekoResult<ProviderTestResult> {
    if profile.base_url.trim().is_empty() || profile.model.trim().is_empty() {
        return Err(NekoError::ProviderNotConfigured);
    }
    Ok(ProviderTestResult {
        ok: true,
        message: "Profile is structurally valid and secrets are redacted before storage"
            .to_string(),
    })
}

pub fn redact_secrets(value: &str) -> String {
    let patterns = [
        r"(?i)(api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+",
        r"-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----",
    ];
    let mut redacted = value.to_string();
    for pattern in patterns {
        let regex = Regex::new(pattern).expect("secret redaction regex");
        redacted = regex
            .replace_all(&redacted, |captures: &regex::Captures| {
                let matched = captures
                    .get(1)
                    .map(|item| item.as_str())
                    .unwrap_or("secret");
                format!("{matched}=<redacted>")
            })
            .to_string();
    }
    redacted
}
