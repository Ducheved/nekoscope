<script lang="ts">
  import { extractDevopsSummary } from "$lib/neko/devopsHints";
  import { markdownStats } from "$lib/neko/markdownLens";
  import { extractMlSummary } from "$lib/neko/mlSignals";
  import type { FilePayload } from "$lib/neko/types";

  export let file: FilePayload;
  $: devops = extractDevopsSummary(file.path, file.content);
  $: ml = safeMl(file);
  $: stats = file.kind === "markdown" ? markdownStats(file.content) : null;

  function safeMl(value: FilePayload) {
    try {
      return extractMlSummary(value.path, value.content);
    } catch {
      return { documentType: "none", metrics: [], signals: [] };
    }
  }
</script>

<section class="metadata" aria-label="Metadata panel">
  <dl>
    <div>
      <dt>Kind</dt>
      <dd>{file.kind}</dd>
    </div>
    <div>
      <dt>Size</dt>
      <dd>{file.size} bytes</dd>
    </div>
    {#if stats}
      <div>
        <dt>Reading</dt>
        <dd>{stats.readingMinutes} min</dd>
      </div>
    {/if}
  </dl>

  {#if devops.highlights.length || devops.warnings.length}
    <h3>{devops.documentType}</h3>
    {#each devops.highlights as item}
      <p>{item}</p>
    {/each}
    {#each devops.warnings as item}
      <p class="warning">{item}</p>
    {/each}
  {/if}

  {#if ml.metrics.length || ml.signals.length}
    <h3>{ml.documentType}</h3>
    {#each ml.metrics as metric}
      <p>{metric.name}: {metric.value}</p>
    {/each}
    {#each ml.signals as signal}
      <p>{signal}</p>
    {/each}
  {/if}
</section>

<style>
  .metadata {
    display: grid;
    gap: 12px;
  }

  dl {
    display: grid;
    gap: 8px;
    margin: 0;
  }

  dl div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.48);
  }

  dt {
    color: var(--kumo-muted);
  }

  dd {
    margin: 0;
  }

  h3 {
    margin: 8px 0 0;
    font-size: 14px;
  }

  p {
    margin: 0;
    color: var(--kumo-muted);
  }

  .warning {
    color: var(--ume-danger);
  }
</style>
