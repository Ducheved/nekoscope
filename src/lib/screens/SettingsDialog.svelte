<script lang="ts">
  import { X } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { localeOptions, translate } from "$lib/neko/i18n";
  import type { AppSettings, LocaleCode, ThemeMode } from "$lib/neko/types";

  export let settings: AppSettings;

  const dispatch = createEventDispatcher<{
    close: void;
    change: AppSettings;
  }>();

  $: t = (key: Parameters<typeof translate>[1]) =>
    translate(settings.locale, key);
  $: themeOptions = [
    { value: "system" as const, label: t("systemTheme") },
    { value: "light" as const, label: t("lightTheme") },
    { value: "dark" as const, label: t("darkTheme") },
  ];

  function update(patch: Partial<AppSettings>) {
    dispatch("change", { ...settings, ...patch });
  }
</script>

<div
  class="backdrop"
  role="presentation"
  on:click|self={() => dispatch("close")}
>
  <div
    class="dialog"
    role="dialog"
    aria-label={t("settingsTitle")}
    aria-modal="true"
  >
    <header>
      <h2>{t("settingsTitle")}</h2>
      <button
        class="icon"
        type="button"
        aria-label={t("closeSettings")}
        on:click={() => dispatch("close")}
      >
        <X size={18} />
      </button>
    </header>

    <section>
      <h3>{t("appearance")}</h3>

      <label class="field">
        <span>{t("language")}</span>
        <select
          value={settings.locale}
          on:change={(event) =>
            update({ locale: event.currentTarget.value as LocaleCode })}
        >
          {#each localeOptions as option (option.code)}
            <option value={option.code}>{option.label}</option>
          {/each}
        </select>
      </label>

      <div class="field">
        <span>{t("theme")}</span>
        <div class="segmented" role="group" aria-label={t("theme")}>
          {#each themeOptions as option (option.value)}
            <button
              type="button"
              class:active={settings.theme === option.value}
              on:click={() => update({ theme: option.value as ThemeMode })}
              >{option.label}</button
            >
          {/each}
        </div>
      </div>

      <div class="field">
        <span>{t("fontScale")} · {Math.round(settings.fontScale * 100)}%</span>
        <div class="slider">
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.fontScale}
            on:input={(event) =>
              update({ fontScale: Number(event.currentTarget.value) })}
          />
          <button
            type="button"
            class="reset"
            on:click={() => update({ fontScale: 1 })}>{t("resetFont")}</button
          >
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(12, 16, 22, 0.4);
    backdrop-filter: blur(12px);
  }

  .dialog {
    width: min(460px, 100%);
    overflow: hidden;
    border: 1px solid var(--yuki-border);
    border-radius: 14px;
    background: var(--surface-strong);
    box-shadow: 0 28px 80px rgba(12, 16, 22, 0.3);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 18px;
    border-bottom: 1px solid var(--yuki-border);
  }

  h2 {
    margin: 0;
    font-size: 17px;
  }

  h3 {
    margin: 0 0 4px;
    color: var(--kumo-muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  section {
    display: grid;
    gap: 16px;
    padding: 18px;
  }

  .field {
    display: grid;
    gap: 7px;
  }

  .field > span {
    color: var(--neko-ink);
    font-size: 13px;
  }

  select {
    width: 100%;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--neko-ink);
    font: inherit;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--yuki-border);
    border-radius: 11px;
    background: var(--control-bg);
  }

  .segmented button {
    min-height: 32px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
    cursor: pointer;
  }

  .segmented button.active {
    border-color: var(--yuki-border);
    background: var(--surface-strong);
    box-shadow: var(--soft-shadow);
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider input {
    flex: 1;
    accent-color: var(--mikan-accent);
  }

  .reset {
    border: 1px solid var(--yuki-border);
    border-radius: 9px;
    padding: 6px 12px;
    background: var(--control-bg);
    color: var(--neko-ink);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .reset:hover {
    background: var(--control-bg-strong);
  }

  .icon {
    display: inline-flex;
    padding: 6px;
    border: 1px solid var(--yuki-border);
    border-radius: 9px;
    background: var(--control-bg);
    color: var(--neko-ink);
    cursor: pointer;
  }

  .icon:hover {
    background: var(--control-bg-strong);
  }
</style>
