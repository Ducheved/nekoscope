<script lang="ts">
  import { Copy, Maximize2, Minus, Plus } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import {
    diagramToMindmap,
    extractDiagramBlocks,
    renderMermaidSvg,
    renderMindmapSvg,
  } from "$lib/neko/diagramGarden";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  export let scale = 1;

  const dispatch = createEventDispatcher<{ scale: number }>();
  let rendered: Record<number, string> = {};
  let errors: Record<number, string> = {};
  let renderRun = 0;
  $: blocks = extractDiagramBlocks(file.content);
  $: void renderBlocks(blocks, scale);

  async function renderBlocks(items: typeof blocks, currentScale: number) {
    const run = ++renderRun;
    const nextRendered: Record<number, string> = {};
    const nextErrors: Record<number, string> = {};
    await Promise.all(
      items.map(async (block, index) => {
        try {
          nextRendered[index] =
            block.language === "mermaid"
              ? await renderMermaidSvg(
                  block.source,
                  `nekoscope-${block.line}-${index}`,
                )
              : renderMindmapSvg(diagramToMindmap(block), currentScale);
        } catch (error) {
          nextErrors[index] =
            error instanceof Error ? error.message : "Diagram render failed";
          nextRendered[index] = renderMindmapSvg(
            diagramToMindmap(block),
            currentScale,
          );
        }
      }),
    );
    if (run === renderRun) {
      rendered = nextRendered;
      errors = nextErrors;
    }
  }
</script>

<section class="diagrams" aria-label="Diagram panel">
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
  </div>
  {#if blocks.length === 0}
    <p>No diagram fences in this file.</p>
  {:else}
    {#each blocks as block}
      <article>
        <header>
          <strong>{block.language}</strong>
          <span>line {block.line}</span>
          <button
            type="button"
            aria-label="Copy source"
            on:click={() => navigator.clipboard?.writeText(block.source)}
          >
            <Copy size={14} />
          </button>
        </header>
        {#if errors[blocks.indexOf(block)]}
          <p class="error">{errors[blocks.indexOf(block)]}</p>
        {/if}
        <div class="canvas">
          {@html rendered[blocks.indexOf(block)] ??
            renderMindmapSvg(diagramToMindmap(block), scale)}
        </div>
      </article>
    {/each}
  {/if}
</section>

<style>
  .diagrams {
    display: grid;
    gap: 12px;
    min-height: 0;
    overflow: auto;
  }

  .controls,
  header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  article {
    display: grid;
    gap: 8px;
  }

  header span {
    color: var(--kumo-muted);
    font-size: 12px;
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
    overflow: auto;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.42);
  }

  p {
    color: var(--kumo-muted);
  }

  .error {
    color: var(--ume-danger);
  }
</style>
