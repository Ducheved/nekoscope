import { beforeEach, describe, expect, it } from "vitest";
import {
  demoTree,
  demoWorkspace,
  readDemoFile,
} from "../src/lib/neko/demoWorkspace";
import { rankFiles } from "../src/lib/neko/quickSwitcher";
import { visibleFiles } from "../src/lib/neko/fileTree";
import { loadSettings } from "../src/lib/neko/settingsStore";

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

  it("ships a readable sample document", () => {
    const first = readDemoFile("README.md");
    expect(demoWorkspace.name).toBe("sample");
    expect(demoTree.length).toBeGreaterThan(0);
    expect(first.kind).toBe("markdown");
    expect(first.content).toContain("NekoScope");
  });

  it("falls back to the README for unknown sample paths", () => {
    expect(readDemoFile("does/not/exist.md").path).toBe("README.md");
  });

  it("ranks quick-switcher entries by file name", () => {
    const ranked = rankFiles(demoTree, "shortcuts", []);
    expect(ranked[0].path).toBe("docs/shortcuts.md");
  });

  it("filters the file tree by substring", () => {
    const shown = visibleFiles(demoTree, "tour");
    expect(shown).toHaveLength(1);
    expect(shown[0].path).toBe("docs/markdown-tour.md");
  });

  it("merges stored settings over the defaults", () => {
    window.localStorage.setItem(
      "nekoscope-settings",
      JSON.stringify({ locale: "ru", fontScale: 1.1 }),
    );
    const loaded = loadSettings();
    expect(loaded.locale).toBe("ru");
    expect(loaded.fontScale).toBe(1.1);
    expect(loaded.theme).toBe("system");
  });
});
