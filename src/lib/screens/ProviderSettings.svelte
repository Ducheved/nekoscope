<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { providerTypes } from "$lib/neko/providerProfiles";
  import type { ProviderProfile } from "$lib/neko/types";

  export let profile: ProviderProfile;

  const dispatch = createEventDispatcher<{ change: ProviderProfile }>();
  $: editable = { ...profile };

  function update(patch: Partial<ProviderProfile>) {
    editable = { ...editable, ...patch };
    dispatch("change", editable);
  }
</script>

<section class="provider" aria-label="Provider settings">
  <label>
    <span>Name</span>
    <input
      value={editable.name}
      on:input={(event) => update({ name: event.currentTarget.value })}
    />
  </label>
  <label>
    <span>Type</span>
    <select
      value={editable.providerType}
      on:change={(event) =>
        update({
          providerType: event.currentTarget
            .value as ProviderProfile["providerType"],
        })}
    >
      {#each providerTypes as type}
        <option value={type}>{type}</option>
      {/each}
    </select>
  </label>
  <label>
    <span>Base URL</span>
    <input
      value={editable.baseUrl}
      on:input={(event) => update({ baseUrl: event.currentTarget.value })}
    />
  </label>
  <label>
    <span>Model</span>
    <input
      value={editable.model}
      on:input={(event) => update({ model: event.currentTarget.value })}
    />
  </label>
  <div class="pair">
    <label>
      <span>Temperature</span>
      <input
        type="number"
        min="0"
        max="2"
        step="0.1"
        value={editable.temperature}
        on:input={(event) =>
          update({ temperature: Number(event.currentTarget.value) })}
      />
    </label>
    <label>
      <span>Max tokens</span>
      <input
        type="number"
        min="128"
        max="65536"
        step="128"
        value={editable.maxTokens}
        on:input={(event) =>
          update({ maxTokens: Number(event.currentTarget.value) })}
      />
    </label>
  </div>
  <label class="checkbox">
    <input
      type="checkbox"
      checked={editable.streaming}
      on:change={(event) => update({ streaming: event.currentTarget.checked })}
    />
    <span>Streaming</span>
  </label>
</section>

<style>
  .provider {
    display: grid;
    gap: 10px;
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

  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
