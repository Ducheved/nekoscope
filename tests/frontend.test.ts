import { beforeEach, describe, expect, it } from "vitest";
import { buildProviderRequest } from "../src/lib/neko/aiBridge";
import {
  demoTree,
  demoWorkspace,
  readDemoFile,
} from "../src/lib/neko/demoWorkspace";
import { renderMindmapSvg } from "../src/lib/neko/diagramGarden";
import { formatDocument } from "../src/lib/neko/formatters";
import { markdownToMindmap } from "../src/lib/neko/mindmapAdapters";
import { rankFiles } from "../src/lib/neko/quickSwitcher";
import { defaultProviderProfile } from "../src/lib/neko/providerProfiles";
import { defaultSettings, loadSettings } from "../src/lib/neko/settingsStore";

describe("frontend behavior", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    } as Storage;
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: storage },
      configurable: true,
    });
  });

  it("opens the sample workspace mock", () => {
    const first = readDemoFile("README.md");
    expect(demoWorkspace.name).toBe("neko-repo");
    expect(demoTree.length).toBeGreaterThan(0);
    expect(first.content).toContain("NekoScope Sample");
  });

  it("ranks quick switcher entries", () => {
    const ranked = rankFiles(demoTree, "metrics", []);
    expect(ranked[0].path).toBe("ml/metrics.json");
  });

  it("builds an Ask AI request without plaintext secrets", () => {
    const request = buildProviderRequest(
      defaultProviderProfile,
      "api_key=secret",
      [{ path: ".env", content: "TOKEN=secret" }],
    );
    expect(JSON.stringify(request)).not.toContain("secret");
  });

  it("saves and loads settings from local storage", () => {
    window.localStorage.setItem(
      "nekoscope-settings",
      JSON.stringify({ locale: "ru", fontScale: 1.1 }),
    );
    expect(loadSettings()).toEqual({
      ...defaultSettings,
      locale: "ru",
      fontScale: 1.1,
    });
  });

  it("renders mindmap SVG state", () => {
    const svg = renderMindmapSvg(markdownToMindmap("# A\n## B"));
    expect(svg).toContain("<svg");
    expect(svg).toContain("B");
  });

  it("creates a format diff flow without writing the source", () => {
    const original = '{"b":2,"a":1}';
    const formatted = formatDocument("config.json", original);
    expect(formatted).not.toBe(original);
    expect(original).toBe('{"b":2,"a":1}');
  });
});
