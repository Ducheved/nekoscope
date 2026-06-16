<script lang="ts">
  import { CheckCircle2, MessageSquarePlus } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import type { CommentItem, FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  export let comments: CommentItem[] = [];

  const dispatch = createEventDispatcher<{
    add: CommentItem;
    resolve: string;
  }>();
  let text = "";
  $: visible = comments.filter((comment) => comment.path === file.path);

  function addComment() {
    const value = text.trim();
    if (!value) return;
    dispatch("add", {
      id: "",
      path: file.path,
      anchor: "file",
      text: value,
      state: "open",
      createdAt: "",
    });
    text = "";
  }
</script>

<section class="comments" aria-label="Comments panel">
  <label>
    <span>Add review comment</span>
    <textarea bind:value={text} rows="3"></textarea>
  </label>
  <button type="button" on:click={addComment}>
    <MessageSquarePlus size={15} />
    <span>Add</span>
  </button>
  <div class="list">
    {#each visible as comment}
      <article class:resolved={comment.state === "resolved"}>
        <p>{comment.text}</p>
        <small>{comment.anchor}</small>
        {#if comment.state !== "resolved"}
          <button
            type="button"
            aria-label="Resolve comment"
            on:click={() => dispatch("resolve", comment.id)}
          >
            <CheckCircle2 size={15} />
          </button>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .comments,
  .list {
    display: grid;
    gap: 10px;
  }

  label {
    display: grid;
    gap: 6px;
    color: var(--kumo-muted);
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
    min-height: 32px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.62);
    color: var(--neko-ink);
    cursor: pointer;
  }

  article {
    display: grid;
    gap: 4px;
    padding: 10px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.52);
  }

  article.resolved {
    opacity: 0.62;
  }

  p {
    margin: 0;
  }

  small {
    color: var(--kumo-muted);
  }
</style>
