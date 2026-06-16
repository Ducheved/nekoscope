<script lang="ts">
  import { Send, ShieldCheck } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import {
    buildProviderRequest,
    estimateContextBytes,
    providerReady,
  } from "$lib/neko/aiBridge";
  import type {
    AiRequest,
    AiResponse,
    AppSettings,
    FilePayload,
  } from "$lib/neko/types";

  export let file: FilePayload;
  export let settings: AppSettings;
  export let response: AiResponse | null = null;

  const dispatch = createEventDispatcher<{ send: AiRequest }>();
  let prompt = "";
  $: context = settings.includeCurrentFile
    ? [{ path: file.path, content: file.content }]
    : [];
  $: bytes = estimateContextBytes(context);
  $: request = buildProviderRequest(settings.providerProfile, prompt, context);
</script>

<section class="ask" aria-label="Ask AI panel">
  <div class="privacy">
    <ShieldCheck size={16} />
    <span
      >{bytes} bytes, {context.length} files, redaction {settings.secretRedaction
        ? "on"
        : "off"}</span
    >
  </div>
  <textarea
    bind:value={prompt}
    rows="5"
    placeholder="Ask about the current file, diagram or folder context"
  ></textarea>
  <button
    type="button"
    disabled={!providerReady(settings.providerProfile) || !prompt.trim()}
    on:click={() => dispatch("send", request)}
  >
    <Send size={15} />
    <span>Send</span>
  </button>
  {#if response}
    <pre>{JSON.stringify(response.requestPreview, null, 2)}</pre>
  {:else}
    <pre>{JSON.stringify(request, null, 2)}</pre>
  {/if}
</section>

<style>
  .ask {
    display: grid;
    gap: 10px;
  }

  .privacy {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--matcha-success);
    font-size: 12px;
  }

  textarea {
    width: 100%;
    min-width: 0;
    resize: vertical;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.62);
    color: var(--neko-ink);
    font: inherit;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    min-height: 34px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.68);
    color: var(--neko-ink);
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  pre {
    overflow: auto;
    max-height: 220px;
    margin: 0;
    padding: 10px;
    border-radius: 8px;
    background: rgba(24, 32, 38, 0.92);
    color: #f7fbff;
  }
</style>
