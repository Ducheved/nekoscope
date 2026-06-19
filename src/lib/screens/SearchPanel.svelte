<script lang="ts">
  import { Search } from "@lucide/svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { translate } from "$lib/neko/i18n";
  import { settingsStore } from "$lib/neko/settingsStore";
  import type { SearchResult } from "$lib/neko/types";

  export let results: SearchResult[] = [];
  export let busy = false;

  const dispatch = createEventDispatcher<{
    query: string;
    choose: SearchResult;
    close: void;
  }>();

  let query = "";
  let active = 0;
  let input: HTMLInputElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: if (active >= results.length) active = Math.max(0, results.length - 1);

  onMount(() => {
    input?.focus();
    return () => clearTimeout(timer);
  });

  function onInput() {
    clearTimeout(timer);
    const value = query;
    timer = setTimeout(() => dispatch("query", value), 220);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = Math.min(active + 1, results.length - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = Math.max(active - 1, 0);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) dispatch("choose", results[active]);
    }
  }
</script>

<div
  class="overlay"
  role="presentation"
  on:click|self={() => dispatch("close")}
>
  <div class="dialog" role="dialog" aria-label={t("search")} aria-modal="true">
    <label>
      <Search size={16} />
      <input
        bind:this={input}
        bind:value={query}
        on:input={onInput}
        on:keydown={handleKeydown}
        placeholder={t("searchPlaceholder")}
      />
      {#if query.trim()}
        <span class="count"
          >{busy ? "…" : `${results.length} ${t("searchResults")}`}</span
        >
      {/if}
    </label>
    <div class="list">
      {#if query.trim() && !busy && results.length === 0}
        <p class="empty">{t("noMatches")}</p>
      {/if}
      {#each results as result, index (result.path + ":" + result.line)}
        <button
          type="button"
          class:active={index === active}
          on:mouseenter={() => (active = index)}
          on:click={() => dispatch("choose", result)}
        >
          <span class="head">
            <span class="path">{result.path}</span>
            <small>{t("line")} {result.line}</small>
          </span>
          <code>{result.excerpt}</code>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    align-items: start;
    justify-items: center;
    padding-top: 10vh;
    background: rgba(12, 18, 26, 0.34);
    backdrop-filter: blur(10px);
  }

  .dialog {
    width: min(720px, calc(100vw - 28px));
    overflow: hidden;
    border: 1px solid var(--yuki-border);
    border-radius: 14px;
    background: var(--surface-strong);
    box-shadow: 0 24px 70px rgba(12, 18, 26, 0.28);
  }

  label {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 13px 14px;
    border-bottom: 1px solid var(--yuki-border);
    color: var(--kumo-muted);
  }

  input {
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
    font-size: 15px;
  }

  .count {
    color: var(--kumo-muted);
    font-size: 12px;
    white-space: nowrap;
  }

  .list {
    display: grid;
    gap: 2px;
    max-height: 60vh;
    overflow: auto;
    padding: 8px;
  }

  button {
    display: grid;
    gap: 3px;
    width: 100%;
    padding: 8px 11px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  button.active {
    border-color: var(--yuki-border);
    background: var(--control-bg-strong);
  }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .path {
    overflow: hidden;
    color: var(--accent-blue);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .head small {
    color: var(--kumo-muted);
    font-size: 11px;
    white-space: nowrap;
  }

  code {
    overflow: hidden;
    color: var(--kumo-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty {
    padding: 12px;
    color: var(--kumo-muted);
    font-size: 13px;
  }
</style>
