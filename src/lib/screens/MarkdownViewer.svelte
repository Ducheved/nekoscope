<script lang="ts">
  import { onMount } from "svelte";
  import { isOneLineJson, formatDocument } from "$lib/neko/formatters";
  import { markdownStats, renderMarkdown } from "$lib/neko/markdownLens";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;

  let html = "";
  let renderId = 0;
  $: stats = file.kind === "markdown" ? markdownStats(file.content) : null;
  $: prettyJson =
    file.kind === "json" && isOneLineJson(file.content)
      ? formatDocument(file.path, file.content)
      : "";

  $: if (file.kind === "markdown") {
    const current = ++renderId;
    renderMarkdown(file.content).then((value) => {
      if (current === renderId) html = value;
    });
  }

  onMount(() => {
    if (file.kind !== "markdown") html = "";
  });
</script>

<article class="viewer" aria-label="Document viewer">
  {#if file.kind === "markdown"}
    {#if stats}
      <div class="stats">
        <span>{stats.words} words</span>
        <span>{stats.readingMinutes} min</span>
        <span>{stats.headings} headings</span>
      </div>
    {/if}
    <div class="markdown-body">{@html html}</div>
  {:else if prettyJson}
    <div class="stats">
      <span>Pretty JSON preview</span>
      <span>original preserved</span>
    </div>
    <pre>{prettyJson}</pre>
  {:else}
    <pre>{file.content}</pre>
  {/if}
</article>

<style>
  .viewer {
    min-height: 0;
    overflow: auto;
    padding: 22px;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .stats span {
    padding: 4px 8px;
    border: 1px solid var(--yuki-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.5);
  }

  pre {
    overflow: auto;
    margin: 0;
    padding: 16px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(24, 32, 38, 0.92);
    color: #f7fbff;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  :global(.markdown-body) {
    color: var(--neko-ink);
    line-height: 1.68;
  }

  :global(.markdown-body h1),
  :global(.markdown-body h2),
  :global(.markdown-body h3) {
    margin-top: 1.35em;
    margin-bottom: 0.45em;
    letter-spacing: 0;
  }

  :global(.markdown-body h1:first-child) {
    margin-top: 0;
  }

  :global(.markdown-body table) {
    width: 100%;
    border-collapse: collapse;
    overflow: auto;
  }

  :global(.markdown-body th) {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.92);
  }

  :global(.markdown-body th),
  :global(.markdown-body td) {
    padding: 8px 10px;
    border: 1px solid var(--yuki-border);
  }

  :global(.markdown-body code) {
    padding: 2px 5px;
    border-radius: 5px;
    background: rgba(24, 32, 38, 0.08);
  }
</style>
