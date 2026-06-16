<script lang="ts">
  import { X } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import type { FilePayload } from "$lib/neko/types";

  export let files: FilePayload[] = [];
  export let activePath = "";

  const dispatch = createEventDispatcher<{ activate: string; close: string }>();
</script>

<div class="tabs" role="tablist" aria-label="Open files">
  {#each files as file}
    <button
      class:active={file.path === activePath}
      type="button"
      role="tab"
      aria-selected={file.path === activePath}
      on:click={() => dispatch("activate", file.path)}
    >
      <span>{file.name}</span>
      <span class="kind">{file.kind}</span>
      <span
        class="close"
        role="button"
        tabindex="0"
        aria-label="Close tab"
        on:click|stopPropagation={() => dispatch("close", file.path)}
        on:keydown={(event) =>
          event.key === "Enter" && dispatch("close", file.path)}
      >
        <X size={13} />
      </span>
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    min-height: 42px;
    padding: 3px;
  }

  button {
    display: grid;
    grid-template-columns: minmax(72px, 1fr) auto auto;
    align-items: center;
    gap: 8px;
    max-width: 230px;
    min-width: 150px;
    padding: 8px 9px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.52);
    color: var(--neko-ink);
    font: inherit;
    cursor: pointer;
  }

  button.active {
    border-color: rgba(240, 138, 75, 0.58);
    background: rgba(255, 255, 255, 0.84);
  }

  span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kind {
    color: var(--kumo-muted);
    font-size: 11px;
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
  }

  .close:hover {
    background: rgba(200, 73, 95, 0.12);
    color: var(--ume-danger);
  }
</style>
