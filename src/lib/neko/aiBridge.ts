import type { AiContextFile, AiRequest, ProviderProfile } from "./types";

export function redactSecrets(value: string) {
  return value
    .replace(
      /(api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+/gi,
      "$1=<redacted>",
    )
    .replace(
      /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
      "<redacted-private-key>",
    );
}

export function estimateContextBytes(context: AiContextFile[]) {
  return context.reduce(
    (total, file) => total + new TextEncoder().encode(file.content).byteLength,
    0,
  );
}

export function buildProviderRequest(
  profile: ProviderProfile,
  prompt: string,
  context: AiContextFile[],
): AiRequest {
  const redactedContext = context.map((file) => ({
    path: file.path,
    content: redactSecrets(file.content),
  }));
  return {
    profile: {
      ...profile,
      apiKey: profile.apiKey ? "<secret-present>" : null,
      headers: profile.headers.map((header) => ({
        name: header.name,
        value: header.name.toLowerCase().includes("authorization")
          ? "<redacted>"
          : header.value,
      })),
    },
    prompt: redactSecrets(prompt),
    context: redactedContext,
  };
}

export function providerReady(profile: ProviderProfile) {
  return Boolean(profile.baseUrl.trim() && profile.model.trim());
}
