import type { ProviderProfile } from "./types";

export const defaultProviderProfile: ProviderProfile = {
  id: "local-ollama",
  name: "Local Ollama",
  providerType: "ollama",
  baseUrl: "http://127.0.0.1:11434",
  model: "llama3.1",
  temperature: 0.2,
  maxTokens: 2048,
  streaming: true,
  apiKey: null,
  headers: [],
  requestTemplate: null,
};

export const providerTypes = [
  "openai-compatible",
  "anthropic-compatible",
  "ollama",
  "generic-http",
] as const;

export function sanitizeProviderProfile(
  profile: ProviderProfile,
): ProviderProfile {
  return {
    ...profile,
    apiKey: profile.apiKey ? "<stored-in-secret-vault>" : null,
    headers: profile.headers.map((header) => ({
      name: header.name,
      value: header.name.toLowerCase().includes("authorization")
        ? "<redacted>"
        : header.value,
    })),
  };
}
