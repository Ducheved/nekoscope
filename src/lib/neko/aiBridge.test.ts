import { describe, expect, it } from "vitest";
import { buildProviderRequest, redactSecrets } from "./aiBridge";
import { defaultProviderProfile } from "./providerProfiles";

describe("aiBridge", () => {
  it("redacts secret-looking values", () => {
    expect(redactSecrets("token=abc123 password:secret")).toContain(
      "<redacted>",
    );
  });

  it("builds provider requests without plaintext keys", () => {
    const request = buildProviderRequest(
      { ...defaultProviderProfile, apiKey: "sk-test" },
      "Explain api_key=hidden",
      [{ path: ".env", content: "PASSWORD=hidden" }],
    );
    expect(JSON.stringify(request)).not.toContain("sk-test");
    expect(JSON.stringify(request)).not.toContain("hidden");
  });
});
