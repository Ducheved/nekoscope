<script lang="ts">
  import { FileCode2, FileText, Folder, Search } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { visibleFiles } from "$lib/neko/fileTree";
  import type { FileTreeEntry } from "$lib/neko/types";

  export let entries: FileTreeEntry[] = [];
  export let activePath = "";

  const dispatch = createEventDispatcher<{ select: FileTreeEntry }>();
  let filter = "";
  $: shown = visibleFiles(entries, filter);
</script>

<section class="explorer" aria-label="Workspace files">
  <label class="filter">
    <Search size={15} />
    <input bind:value={filter} placeholder="Filter files" />
  </label>
  <div class="tree">
    {#each shown as entry}
      <button
        class:active={entry.path === activePath}
        class:dir={entry.isDir}
        type="button"
        title={entry.path}
        on:click={() => dispatch("select", entry)}
      >
        {#if entry.isDir}
          <Folder size={16} />
        {:else if entry.kind === "markdown"}
          <FileText size={16} />
        {:else}
          <FileCode2 size={16} />
        {/if}
        <span>{entry.path}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .explorer {
    display: grid;
    gap: 12px;
    min-height: 0;
  }

  .filter {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.54);
  }

  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
  }

  .tree {
    display: grid;
    gap: 4px;
    overflow: auto;
    min-height: 0;
    padding-right: 3px;
  }

  button {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 34px;
    padding: 7px 9px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--neko-ink);
    text-align: left;
    font: inherit;
    cursor: pointer;
  }

  button:hover,
  button.active {
    border-color: var(--yuki-border);
    background: rgba(255, 255, 255, 0.68);
  }

  button span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dir {
    color: var(--mikan-accent);
  }
</style>
