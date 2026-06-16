<script lang="ts">
  import { extractOutline } from "$lib/neko/markdownLens";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  $: outline = file.kind === "markdown" ? extractOutline(file.content) : [];
</script>

<section class="outline" aria-label="Document outline">
  {#if outline.length === 0}
    <p>No headings found.</p>
  {:else}
    {#each outline as item}
      <a
        style={`padding-left: ${(item.level - 1) * 12}px`}
        href={`#${item.id}`}
      >
        <span>{item.text}</span>
        <small>{item.line}</small>
      </a>
    {/each}
  {/if}
</section>

<style>
  .outline {
    display: grid;
    gap: 4px;
  }

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 8px;
    border-radius: 8px;
    color: var(--neko-ink);
    text-decoration: none;
  }

  a:hover {
    background: rgba(255, 255, 255, 0.58);
  }

  small,
  p {
    color: var(--kumo-muted);
  }
</style>
