import { describe, expect, it } from "vitest";
import { buildLocalLinkGraph } from "./folderIndex";
import {
  extractOutline,
  extractStandardLinks,
  extractWikiLinks,
} from "./markdownLens";
import type { FilePayload } from "./types";

describe("markdownLens", () => {
  it("extracts headings with line numbers", () => {
    const outline = extractOutline("# One\n\n## Two\nText\n### Three");
    expect(outline).toEqual([
      { id: "one", text: "One", level: 1, line: 1 },
      { id: "two", text: "Two", level: 2, line: 3 },
      { id: "three", text: "Three", level: 3, line: 5 },
    ]);
  });

  it("parses wiki and markdown links", () => {
    const source =
      "See [[docs/architecture]] and [ADR](docs/adr/0001-record-architecture-decisions.md).";
    expect(extractWikiLinks(source)).toEqual(["docs/architecture"]);
    expect(extractStandardLinks(source)).toEqual([
      "docs/adr/0001-record-architecture-decisions.md",
    ]);
  });

  it("builds a local link graph with broken links", () => {
    const files: FilePayload[] = [
      {
        path: "README.md",
        name: "README.md",
        kind: "markdown",
        content: "[A](docs/a.md) [[missing]]",
        size: 0,
      },
      {
        path: "docs/a.md",
        name: "a.md",
        kind: "markdown",
        content: "# A",
        size: 0,
      },
    ];
    const graph = buildLocalLinkGraph(files);
    expect(graph.edges).toHaveLength(1);
    expect(graph.brokenLinks).toHaveLength(1);
  });
});
