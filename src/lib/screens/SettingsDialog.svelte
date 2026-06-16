<script lang="ts">
  import { X } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { localeOptions } from "$lib/neko/i18n";
  import { defaultSyncProfile } from "$lib/neko/syncBridge";
  import { themeModes } from "$lib/neko/themeTokens";
  import type {
    AppSettings,
    LocaleCode,
    SyncProfile,
    ThemeMode,
  } from "$lib/neko/types";
  import ProviderSettings from "./ProviderSettings.svelte";

  export let settings: AppSettings;

  const dispatch = createEventDispatcher<{
    close: void;
    change: AppSettings;
    saveSync: SyncProfile;
  }>();
  $: editable = {
    ...settings,
    providerProfile: { ...settings.providerProfile },
  };
  $: syncProfile = editable.syncProfiles[0] ?? defaultSyncProfile;

  function update(patch: Partial<AppSettings>) {
    editable = { ...editable, ...patch };
    dispatch("change", editable);
  }

  function updateSync(patch: Partial<SyncProfile>) {
    const next = { ...syncProfile, ...patch };
    update({
      syncProfiles: [
        next,
        ...editable.syncProfiles.filter((profile) => profile.id !== next.id),
      ],
    });
  }
</script>

<div class="backdrop" role="presentation">
  <div
    class="dialog"
    role="dialog"
    aria-label="Settings"
    aria-modal="true"
    tabindex="-1"
  >
    <header>
      <h2>Settings</h2>
      <button
        type="button"
        aria-label="Close settings"
        on:click={() => dispatch("close")}
      >
        <X size={17} />
      </button>
    </header>

    <div class="grid">
      <section>
        <h3>Experience</h3>
        <label>
          <span>Language</span>
          <select
            value={editable.locale}
            on:change={(event) =>
              update({ locale: event.currentTarget.value as LocaleCode })}
          >
            {#each localeOptions as option}
              <option value={option.code}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>Theme</span>
          <select
            value={editable.theme}
            on:change={(event) =>
              update({ theme: event.currentTarget.value as ThemeMode })}
          >
            {#each themeModes as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>Font scale</span>
          <input
            type="range"
            min="0.85"
            max="1.25"
            step="0.05"
            value={editable.fontScale}
            on:input={(event) =>
              update({ fontScale: Number(event.currentTarget.value) })}
          />
        </label>
      </section>

      <section>
        <h3>AI provider</h3>
        <ProviderSettings
          profile={editable.providerProfile}
          on:change={(event) => update({ providerProfile: event.detail })}
        />
      </section>

      <section>
        <h3>Sync</h3>
        <label>
          <span>Name</span>
          <input
            value={syncProfile.name}
            on:input={(event) =>
              updateSync({ name: event.currentTarget.value })}
          />
        </label>
        <label>
          <span>Storage path</span>
          <input
            value={syncProfile.rootPath}
            placeholder="Cloud-mounted folder or network share"
            on:input={(event) =>
              updateSync({ rootPath: event.currentTarget.value })}
          />
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            checked={syncProfile.enabled}
            on:change={(event) =>
              updateSync({ enabled: event.currentTarget.checked })}
          />
          <span>Enable profile</span>
        </label>
        <button type="button" on:click={() => dispatch("saveSync", syncProfile)}
          >Save sync profile</button
        >
      </section>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 22px;
    background: rgba(24, 32, 38, 0.32);
    backdrop-filter: blur(16px);
  }

  .dialog {
    width: min(980px, 100%);
    max-height: min(760px, 94vh);
    overflow: auto;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 24px 70px rgba(24, 32, 38, 0.22);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid var(--yuki-border);
  }

  h2,
  h3 {
    margin: 0;
    letter-spacing: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 18px;
  }

  section {
    display: grid;
    align-content: start;
    gap: 11px;
  }

  label {
    display: grid;
    gap: 5px;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  input,
  select {
    min-width: 0;
    width: 100%;
    min-height: 34px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.68);
    color: var(--neko-ink);
    font: inherit;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.68);
    color: var(--neko-ink);
    cursor: pointer;
  }

  @media (max-width: 860px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
