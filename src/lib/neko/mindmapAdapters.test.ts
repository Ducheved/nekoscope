import { describe, expect, it } from "vitest";
import { renderMindmapSvg } from "./diagramGarden";
import { markdownToMindmap, mermaidMindmapToTree } from "./mindmapAdapters";

describe("mindmapAdapters", () => {
  it("creates a markdown heading tree", () => {
    const tree = markdownToMindmap("# Root\n## Child\n### Leaf");
    expect(tree.children[0].label).toBe("Root");
    expect(tree.children[0].children[0].label).toBe("Child");
  });

  it("renders Mermaid mindmap source as SVG", () => {
    const tree = mermaidMindmapToTree(
      "mindmap\n  root((NekoScope))\n    Diagrams",
    );
    const svg = renderMindmapSvg(tree);
    expect(svg).toContain("<svg");
    expect(svg).toContain("Diagrams");
  });
});
