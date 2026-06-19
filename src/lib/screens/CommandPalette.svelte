<script lang="ts">
  import { Command, Search } from "@lucide/svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { commandActions } from "$lib/neko/commandPalette";
  import { translate, type MessageKey } from "$lib/neko/i18n";
  import { settingsStore } from "$lib/neko/settingsStore";

  const dispatch = createEventDispatcher<{ choose: string; close: void }>();
  let query = "";
  let active = 0;
  let input: HTMLInputElement | null = null;

  const labelKeys: Record<string, MessageKey> = {
    "open-folder": "openFolder",
    "open-file": "openFile",
    "quick-switcher": "quickSwitcher",
    search: "search",
    "toggle-view": "cycleView",
    "toggle-outline": "toggleOutline",
    "toggle-sidebar": "toggleSidebar",
    "toggle-theme": "toggleTheme",
    zen: "zenMode",
    "open-external": "openExternal",
    reveal: "reveal",
    settings: "settings",
  };

  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: commands = commandActions
    .map((command) => ({ ...command, label: t(labelKeys[command.id]) }))
    .filter((command) =>
      command.label.toLowerCase().includes(query.trim().toLowerCase()),
    );
  $: if (active >= commands.length) active = Math.max(0, commands.length - 1);

  onMount(() => input?.focus());

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = Math.min(active + 1, commands.length - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = Math.max(active - 1, 0);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = commands[active];
      if (command) dispatch("choose", command.id);
    }
  }
</script>

<div
  class="overlay"
  role="presentation"
  on:click|self={() => dispatch("close")}
>
  <div
    class="dialog"
    role="dialog"
    aria-label={t("commandPalette")}
    aria-modal="true"
  >
    <label>
      <Command size={16} />
      <input
        bind:this={input}
        bind:value={query}
        on:keydown={handleKeydown}
        placeholder={t("runCommand")}
      />
      <Search size={15} />
    </label>
    <div class="list">
      {#each commands as command, index (command.id)}
        <button
          type="button"
          class:active={index === active}
          on:mouseenter={() => (active = index)}
          on:click={() => dispatch("choose", command.id)}
        >
          <span>{command.label}</span>
          <kbd>{command.shortcut}</kbd>
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
    background: rgba(12, 18, 26, 0.34);
    backdrop-filter: blur(10px);
  }

  .dialog {
    width: min(620px, calc(100vw - 28px));
    overflow: hidden;
    border: 1px solid var(--yuki-border);
    border-radius: 14px;
    background: var(--surface-strong);
    box-shadow: 0 24px 70px rgba(12, 18, 26, 0.28);
  }

  label {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) 18px;
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

  .list {
    display: grid;
    gap: 2px;
    max-height: 50vh;
    overflow: auto;
    padding: 8px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 9px 11px;
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

  kbd {
    color: var(--kumo-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
  }
</style>
