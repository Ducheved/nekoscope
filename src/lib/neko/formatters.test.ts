import { describe, expect, it } from "vitest";
import { detectDocumentKind } from "./formatters";

describe("detectDocumentKind", () => {
  it("recognizes Markdown extensions", () => {
    expect(detectDocumentKind("README.md")).toBe("markdown");
    expect(detectDocumentKind("notes.markdown")).toBe("markdown");
    expect(detectDocumentKind("doc.mdx")).toBe("markdown");
  });

  it("recognizes config formats by extension", () => {
    expect(detectDocumentKind("config.json")).toBe("json");
    expect(detectDocumentKind("tsconfig.jsonc")).toBe("jsonc");
    expect(detectDocumentKind("values.yaml")).toBe("yaml");
    expect(detectDocumentKind("Cargo.toml")).toBe("toml");
    expect(detectDocumentKind("main.tf")).toBe("terraform");
    expect(detectDocumentKind("Dockerfile")).toBe("dockerfile");
  });

  it("falls back to JSON when content looks like JSON", () => {
    expect(detectDocumentKind("data", '{"ok":true}')).toBe("json");
  });

  it("falls back to text for unknown files", () => {
    expect(detectDocumentKind("LICENSE")).toBe("text");
  });
});
