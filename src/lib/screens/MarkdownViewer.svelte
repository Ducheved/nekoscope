<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { translate } from "$lib/neko/i18n";
  import { markdownStats, renderMarkdown } from "$lib/neko/markdownLens";
  import { settingsStore } from "$lib/neko/settingsStore";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  export let themeKey = "light";
  export let scrollTarget = "";
  export let scrollNonce = 0;

  const dispatch = createEventDispatcher<{
    navigate: string;
    external: string;
  }>();

  let html = "";
  let renderId = 0;
  let container: HTMLElement | null = null;

  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: stats = markdownStats(file.content);

  $: {
    void themeKey;
    const current = ++renderId;
    const source = file.content;
    renderMarkdown(source).then((value) => {
      if (current === renderId) html = value;
    });
  }

  $: if (html && scrollTarget) {
    void scrollNonce;
    queueScroll(scrollTarget);
  }

  onMount(() => {
    container?.addEventListener("click", handleClick);
    return () => container?.removeEventListener("click", handleClick);
  });

  function queueScroll(id: string) {
    requestAnimationFrame(() => {
      const el = container?.querySelector(`#${cssEscape(id)}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function cssEscape(value: string) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
    return value.replace(/[^\w-]/g, "\\$&");
  }

  function isExternal(href: string) {
    return /^(https?:|mailto:|tel:)/i.test(href);
  }

  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const copy = target.closest(
      "button[data-copy]",
    ) as HTMLButtonElement | null;
    if (copy) {
      const code = copy
        .closest(".neko-code-card")
        ?.querySelector("code")?.textContent;
      if (code) {
        void navigator.clipboard?.writeText(code).then(() => {
          copy.textContent = t("copied");
          setTimeout(() => (copy.textContent = "copy"), 1200);
        });
      }
      return;
    }
    const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (!href) return;
    if (href.startsWith("#")) {
      event.preventDefault();
      queueScroll(href.slice(1));
      return;
    }
    event.preventDefault();
    if (isExternal(href)) dispatch("external", href);
    else dispatch("navigate", href);
  }
</script>

<article class="viewer" aria-label="Document viewer">
  <div class="stats">
    <span>{stats.words} {t("words")}</span>
    <span>{stats.readingMinutes} {t("minRead")}</span>
    <span>{stats.headings} {t("headings")}</span>
  </div>
  <div class="markdown-body" bind:this={container}>
    {@html html}
  </div>
</article>

<style>
  .viewer {
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 28px clamp(20px, 4vw, 56px);
    scroll-padding-top: 16px;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .stats span {
    padding: 4px 9px;
    border: 1px solid var(--yuki-border);
    border-radius: 999px;
    background: var(--control-bg);
  }

  :global(.markdown-body) {
    max-width: 860px;
    margin: 0 auto;
    color: var(--neko-ink);
    line-height: 1.7;
  }

  :global(.markdown-body > *:first-child) {
    margin-top: 0;
  }

  :global(.markdown-body h1),
  :global(.markdown-body h2),
  :global(.markdown-body h3),
  :global(.markdown-body h4) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.25;
    scroll-margin-top: 16px;
  }

  :global(.markdown-body h1) {
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.15;
  }

  :global(.markdown-body h2) {
    font-size: 24px;
    padding-bottom: 0.25em;
    border-bottom: 1px solid var(--yuki-border);
  }

  :global(.markdown-body h3) {
    font-size: 19px;
  }

  :global(.markdown-body a) {
    color: var(--accent-blue);
    text-decoration: none;
  }

  :global(.markdown-body a:hover) {
    text-decoration: underline;
  }

  :global(.markdown-body blockquote) {
    margin: 1.1em 0;
    padding: 2px 16px;
    border-left: 3px solid var(--mikan-accent);
    color: var(--kumo-muted);
  }

  :global(.markdown-body img) {
    max-width: 100%;
    border-radius: 8px;
  }

  :global(.markdown-body hr) {
    border: 0;
    border-top: 1px solid var(--yuki-border);
    margin: 2em 0;
  }

  :global(.markdown-body table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.1em 0;
    overflow: auto;
    display: block;
  }

  :global(.markdown-body th) {
    background: var(--surface-strong);
  }

  :global(.markdown-body th),
  :global(.markdown-body td) {
    padding: 8px 11px;
    border: 1px solid var(--yuki-border);
  }

  :global(.markdown-body :not(pre) > code) {
    padding: 2px 6px;
    border-radius: 5px;
    background: var(--inline-code-bg);
    color: var(--inline-code-ink);
    font-size: 0.92em;
  }

  :global(.markdown-body ul[class~="contains-task-list"]) {
    list-style: none;
    padding-left: 1.1em;
  }

  :global(.markdown-body .neko-code-card),
  :global(.markdown-body .neko-diagram-card) {
    margin: 22px 0;
    overflow: hidden;
    border: 1px solid var(--yuki-border);
    border-radius: 12px;
    background: var(--surface-strong);
    box-shadow: var(--soft-shadow);
  }

  :global(.markdown-body .neko-code-card figcaption),
  :global(.markdown-body .neko-diagram-card figcaption) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 0;
    padding: 8px 12px;
    border-bottom: 1px solid var(--yuki-border);
    color: var(--kumo-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :global(.markdown-body .neko-copy) {
    border: 1px solid var(--yuki-border);
    border-radius: 7px;
    padding: 2px 9px;
    background: var(--control-bg);
    color: var(--kumo-muted);
    font: inherit;
    font-size: 11px;
    text-transform: none;
    letter-spacing: 0;
    cursor: pointer;
  }

  :global(.markdown-body .neko-copy:hover) {
    background: var(--control-bg-strong);
    color: var(--neko-ink);
  }

  :global(.markdown-body .neko-code-card pre) {
    margin: 0;
    overflow: auto;
    padding: 14px 16px;
    background: var(--code-bg);
    color: var(--code-ink);
    line-height: 1.55;
  }

  :global(.markdown-body .neko-diagram-stage) {
    overflow: auto;
    padding: 16px;
    text-align: center;
    background: var(--diagram-bg);
  }

  :global(.markdown-body .neko-diagram-stage svg) {
    max-width: 100%;
    height: auto;
  }

  :global(.markdown-body .neko-diagram-card details) {
    border-top: 1px solid var(--yuki-border);
  }

  :global(.markdown-body .neko-diagram-card summary) {
    cursor: pointer;
    padding: 8px 12px;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  :global(.markdown-body .neko-diagram-error) {
    margin: 0;
    padding: 9px 12px;
    color: var(--ume-danger);
  }

  :global(.tok-key),
  :global(.tok-keyword),
  :global(.tok-manifest-key) {
    color: var(--syntax-keyword);
  }

  :global(.tok-resource) {
    color: var(--mikan-accent);
    font-weight: 700;
  }

  :global(.tok-api) {
    color: var(--accent-blue);
  }

  :global(.tok-string) {
    color: var(--syntax-string);
  }

  :global(.tok-number),
  :global(.tok-constant) {
    color: var(--syntax-number);
  }

  :global(.tok-comment) {
    color: var(--syntax-comment);
  }
</style>
