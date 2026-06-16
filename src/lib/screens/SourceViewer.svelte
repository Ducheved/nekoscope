<script lang="ts">
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
</script>

<section class="source" aria-label="Source viewer">
  <pre>{file.content}</pre>
</section>

<style>
  .source {
    min-height: 0;
    overflow: auto;
    padding: 18px;
  }

  pre {
    min-height: 100%;
    margin: 0;
    padding: 16px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(24, 32, 38, 0.92);
    color: #f7fbff;
    line-height: 1.55;
    white-space: pre-wrap;
  }
</style>
