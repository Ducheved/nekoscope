<script lang="ts">
  import { Copy, Download, Maximize2, Minus, Plus } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { renderMindmapSvg } from "$lib/neko/diagramGarden";
  import {
    jsonToMindmap,
    markdownToMindmap,
    opmlToMindmap,
    yamlToMindmap,
  } from "$lib/neko/mindmapAdapters";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  export let scale = 1;

  const dispatch = createEventDispatcher<{ scale: number }>();
  $: svg = renderMindmapSvg(treeForFile(file), scale);

  function treeForFile(value: FilePayload) {
    try {
      if (value.kind === "json") return jsonToMindmap(value.content);
      if (value.kind === "yaml") return yamlToMindmap(value.content);
      if (value.kind === "opml") return opmlToMindmap(value.content);
      return markdownToMindmap(value.content);
    } catch {
      return markdownToMindmap(
        `# ${value.name}\n\n## Unable to parse as a tree`,
      );
    }
  }

  function exportSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${file.name}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="mindmap" aria-label="Mindmap panel">
  <div class="controls">
    <button
      type="button"
      aria-label="Zoom out"
      on:click={() => dispatch("scale", Math.max(0.5, scale - 0.1))}
    >
      <Minus size={15} />
    </button>
    <button
      type="button"
      aria-label="Fit"
      on:click={() => dispatch("scale", 1)}
    >
      <Maximize2 size={15} />
    </button>
    <button
      type="button"
      aria-label="Zoom in"
      on:click={() => dispatch("scale", Math.min(2.4, scale + 0.1))}
    >
      <Plus size={15} />
    </button>
    <button
      type="button"
      aria-label="Copy source"
      on:click={() => navigator.clipboard?.writeText(file.content)}
    >
      <Copy size={15} />
    </button>
    <button type="button" aria-label="Export SVG" on:click={exportSvg}>
      <Download size={15} />
    </button>
  </div>
  <div class="canvas">{@html svg}</div>
</section>

<style>
  .mindmap {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
    min-height: 0;
  }

  .controls {
    display: flex;
    gap: 6px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.62);
    color: var(--neko-ink);
    cursor: pointer;
  }

  .canvas {
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.42);
  }
</style>
