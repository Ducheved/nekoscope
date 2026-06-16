<script lang="ts">
  import { Search } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { rankFiles } from "$lib/neko/quickSwitcher";
  import type { FileTreeEntry } from "$lib/neko/types";

  export let entries: FileTreeEntry[] = [];
  export let recent: string[] = [];

  const dispatch = createEventDispatcher<{
    choose: FileTreeEntry;
    close: void;
  }>();
  let query = "";
  $: files = rankFiles(entries, query, recent).slice(0, 20);
</script>

<div class="overlay" role="presentation">
  <div
    class="dialog"
    role="dialog"
    aria-label="Quick switcher"
    aria-modal="true"
    tabindex="-1"
  >
    <label>
      <Search size={16} />
      <input bind:value={query} placeholder="Switch file" />
    </label>
    <div class="list">
      {#each files as file}
        <button type="button" on:click={() => dispatch("choose", file)}>
          <span>{file.path}</span>
          <small>{file.kind}</small>
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
    padding-top: 12vh;
    background: rgba(24, 32, 38, 0.22);
    backdrop-filter: blur(12px);
  }

  .dialog {
    width: min(680px, calc(100vw - 28px));
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 24px 70px rgba(24, 32, 38, 0.2);
  }

  label {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid var(--yuki-border);
  }

  input {
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
  }

  .list {
    display: grid;
    gap: 4px;
    max-height: 420px;
    overflow: auto;
    padding: 8px;
  }

  button {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 9px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
    cursor: pointer;
  }

  button:hover {
    border-color: var(--yuki-border);
    background: rgba(255, 255, 255, 0.74);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--kumo-muted);
  }
</style>
