import type { ProviderProfile } from "./types";

export function sealProfileForStorage(profile: ProviderProfile) {
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

export function hasPlaintextSecret(value: unknown) {
  return (
    JSON.stringify(value).toLowerCase().includes("sk-") ||
    JSON.stringify(value).toLowerCase().includes("bearer ")
  );
}
