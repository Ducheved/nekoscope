<script lang="ts">
  import { highlightSource } from "$lib/neko/markdownLens";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  export let highlightLine: number | null = null;

  let container: HTMLElement | null = null;

  $: language =
    file.kind === "yaml"
      ? "kubernetes"
      : file.kind === "terraform"
        ? "hcl"
        : file.kind;
  $: lines = file.content.replace(/\n$/, "").split("\n");

  $: if (highlightLine && container) scrollToLine(highlightLine);

  function scrollToLine(line: number) {
    requestAnimationFrame(() => {
      const el = container?.querySelector(`[data-line="${line}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
</script>

<section class="source" aria-label="Source viewer" bind:this={container}>
  <div class="code">
    {#each lines as line, index (index)}
      <div
        class="row"
        class:active={highlightLine === index + 1}
        data-line={index + 1}
      >
        <span class="ln" aria-hidden="true">{index + 1}</span>
        <code>{@html highlightSource(line, language) || "&nbsp;"}</code>
      </div>
    {/each}
  </div>
</section>

<style>
  .source {
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 16px;
  }

  .code {
    min-height: 100%;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--code-bg);
    color: var(--code-ink);
    padding: 12px 0;
    font-family:
      ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
      "Liberation Mono", monospace;
    font-size: 0.9em;
    line-height: 1.6;
  }

  .row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 12px;
  }

  .row.active {
    background: color-mix(in srgb, var(--mikan-accent) 22%, transparent);
  }

  .ln {
    text-align: right;
    padding-right: 4px;
    color: color-mix(in srgb, var(--code-ink) 38%, transparent);
    user-select: none;
  }

  code {
    white-space: pre-wrap;
    word-break: break-word;
    padding-right: 14px;
  }
</style>
