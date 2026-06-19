<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { extractOutline } from "$lib/neko/markdownLens";
  import { translate } from "$lib/neko/i18n";
  import { settingsStore } from "$lib/neko/settingsStore";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;

  const dispatch = createEventDispatcher<{ select: string }>();
  $: outline = file.kind === "markdown" ? extractOutline(file.content) : [];
  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
</script>

<nav class="outline" aria-label="Document outline">
  {#if outline.length === 0}
    <p class="empty">{t("noHeadings")}</p>
  {:else}
    {#each outline as item (item.id + item.line)}
      <button
        type="button"
        style={`padding-left: ${6 + (item.level - 1) * 14}px`}
        class:lead={item.level === 1}
        on:click={() => dispatch("select", item.id)}
      >
        <span>{item.text}</span>
      </button>
    {/each}
  {/if}
</nav>

<style>
  .outline {
    display: grid;
    align-content: start;
    gap: 2px;
  }

  button {
    display: block;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: var(--kumo-muted);
    text-align: left;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  button.lead {
    color: var(--neko-ink);
    font-weight: 600;
  }

  button:hover {
    border-color: var(--yuki-border);
    background: var(--control-bg-strong);
    color: var(--neko-ink);
  }

  button span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty {
    color: var(--kumo-muted);
    font-size: 13px;
  }
</style>
