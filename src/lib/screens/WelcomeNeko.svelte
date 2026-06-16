<script lang="ts">
  import { FolderOpen, Languages, Network, PlayCircle } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { localeOptions, translate } from "$lib/neko/i18n";
  import type { LocaleCode } from "$lib/neko/types";

  export let locale: LocaleCode = "en";

  const dispatch = createEventDispatcher<{
    sample: void;
    open: void;
    locale: LocaleCode;
  }>();
  $: t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
</script>

<section class="welcome" aria-label="Startup guide">
  <div class="brand">
    <div class="ears" aria-hidden="true"></div>
    <h1>{t("welcomeTitle")}</h1>
    <p>{t("welcomeSubtitle")}</p>
  </div>
  <div class="steps">
    <article>
      <FolderOpen size={18} />
      <span>{t("startupStepOne")}</span>
    </article>
    <article>
      <PlayCircle size={18} />
      <span>{t("startupStepTwo")}</span>
    </article>
    <article>
      <Network size={18} />
      <span>{t("startupStepThree")}</span>
    </article>
  </div>
  <div class="actions">
    <button type="button" on:click={() => dispatch("open")}>
      <FolderOpen size={17} />
      <span>{t("openFolder")}</span>
    </button>
    <button type="button" on:click={() => dispatch("sample")}>
      <PlayCircle size={17} />
      <span>{t("sampleWorkspace")}</span>
    </button>
    <label>
      <Languages size={16} />
      <select
        value={locale}
        on:change={(event) =>
          dispatch("locale", event.currentTarget.value as LocaleCode)}
      >
        {#each localeOptions as option}
          <option value={option.code}>{option.label}</option>
        {/each}
      </select>
    </label>
  </div>
</section>

<style>
  .welcome {
    display: grid;
    gap: 18px;
    align-content: center;
    min-height: 100%;
    padding: 28px;
  }

  .brand {
    display: grid;
    gap: 8px;
  }

  .ears {
    width: 58px;
    height: 42px;
    background:
      linear-gradient(
        135deg,
        transparent 44%,
        var(--mikan-accent) 45% 58%,
        transparent 59%
      ),
      linear-gradient(
        225deg,
        transparent 44%,
        var(--mikan-accent) 45% 58%,
        transparent 59%
      );
    background-position:
      left top,
      right top;
    background-size: 50% 100%;
    background-repeat: no-repeat;
  }

  h1 {
    margin: 0;
    color: var(--neko-ink);
    font-size: 44px;
    letter-spacing: 0;
  }

  p {
    max-width: 620px;
    margin: 0;
    color: var(--kumo-muted);
    font-size: 17px;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  article {
    display: grid;
    gap: 10px;
    align-content: start;
    min-height: 116px;
    padding: 14px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.58);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  button,
  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    color: var(--neko-ink);
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  select {
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  @media (max-width: 820px) {
    .steps {
      grid-template-columns: 1fr;
    }
  }
</style>
