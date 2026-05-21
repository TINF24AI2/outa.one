<script lang="ts">
  import { Copy } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  import { m } from "$lib/paraglide/messages";

  let { key }: { key: string } = $props();

  let copied = $state(false);
  let hovering = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  const masked = $derived(key.replace(/[a-zA-Z0-9]/g, "*"));

  function copyKey() {
    navigator.clipboard.writeText(key).then(() => {
      copied = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => (copied = false), 1000);
    });
  }
</script>

<button
  type="button"
  class="relative w-fit cursor-pointer overflow-hidden rounded bg-gray-50 px-2 font-mono text-sm tabular-nums"
  onclick={copyKey}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onfocus={() => (hovering = true)}
  onblur={() => (hovering = false)}
  ontouchstart={() => (hovering = true)}
>
  {hovering ? key : masked}

  {#if copied}
    <span
      transition:fade={{ duration: 250 }}
      class="bg-opacity-75 pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-blue-600 font-mono text-xs text-white tabular-nums"
    >
      <Copy class="mr-1 h-3 w-3" />
      {m.licenses_key_copied()}
    </span>
  {/if}
</button>
