# Provider Setup

## OpenAI-Compatible

Set provider type to `openai-compatible`, enter the base URL, model name and API key, then keep redaction enabled.

## Anthropic-Compatible

Set provider type to `anthropic-compatible`, enter the compatible endpoint, model name and key supplied by the endpoint.

## Ollama

Use base URL `http://127.0.0.1:11434` and a locally installed model such as `llama3.1`.

## Generic HTTP

Use `generic-http` for internal gateways. Headers and request templates are sanitized before storage when they contain authorization fields.
