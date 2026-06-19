import { describe, expect, it } from "vitest";
import {
  extractOutline,
  headingId,
  highlightSource,
  markdownStats,
  renderMarkdown,
} from "./markdownLens";

describe("markdownLens", () => {
  it("extracts headings with line numbers", () => {
    const outline = extractOutline("# One\n\n## Two\nText\n### Three");
    expect(outline).toEqual([
      { id: "one", text: "One", level: 1, line: 1 },
      { id: "two", text: "Two", level: 2, line: 3 },
      { id: "three", text: "Three", level: 3, line: 5 },
    ]);
  });

  it("ignores '#' lines inside fenced code blocks", () => {
    const outline = extractOutline("# Real\n\n```sh\n# not a heading\n```\n");
    expect(outline.map((item) => item.text)).toEqual(["Real"]);
  });

  it("disambiguates duplicate heading slugs", () => {
    const outline = extractOutline("# Notes\n\n# Notes");
    expect(outline.map((item) => item.id)).toEqual(["notes", "notes-1"]);
  });

  it("computes reading stats", () => {
    const stats = markdownStats("# Title\n\nword ".repeat(50));
    expect(stats.words).toBeGreaterThan(0);
    expect(stats.readingMinutes).toBeGreaterThanOrEqual(1);
  });

  it("slugifies heading text", () => {
    expect(headingId("Hello, World!")).toBe("hello-world");
  });

  it("highlights Kubernetes-style manifest tokens", () => {
    const html = highlightSource(
      "apiVersion: apps/v1\nkind: Deployment\n",
      "kubernetes",
    );
    expect(html).toContain("tok-manifest-key");
    expect(html).toContain("tok-api");
    expect(html).toContain("tok-resource");
  });

  it("renders fenced code as a highlighted viewer block", async () => {
    const html = await renderMarkdown('# API\n\n```json\n{"ok":true}\n```');
    expect(html).toContain('id="api"');
    expect(html).toContain("neko-code-card");
    expect(html).toContain("tok-key");
  }, 30000);

  it("keeps outline ids in sync with rendered heading ids", async () => {
    const md = "## Setup & Install\n\n## See [docs](/guide)\n";
    const outline = extractOutline(md);
    expect(outline.map((item) => ({ id: item.id, text: item.text }))).toEqual([
      { id: "setup-install", text: "Setup & Install" },
      { id: "see-docs", text: "See docs" },
    ]);
    const html = await renderMarkdown(md);
    for (const item of outline) {
      expect(html).toContain(`id="${item.id}"`);
    }
  }, 30000);
});
