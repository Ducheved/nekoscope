<script lang="ts">
  import { Search } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { filterCommands } from "$lib/neko/commandPalette";

  const dispatch = createEventDispatcher<{ choose: string; close: void }>();
  let query = "";
  $: commands = filterCommands(query);
</script>

<div class="overlay" role="presentation">
  <div
    class="dialog"
    role="dialog"
    aria-label="Command palette"
    aria-modal="true"
    tabindex="-1"
  >
    <label>
      <Search size={16} />
      <input bind:value={query} placeholder="Run command" />
    </label>
    <div class="list">
      {#each commands as command}
        <button type="button" on:click={() => dispatch("choose", command.id)}>
          <span>{command.label}</span>
          <small>{command.shortcut}</small>
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
    width: min(640px, calc(100vw - 28px));
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

  small {
    color: var(--kumo-muted);
  }
</style>
