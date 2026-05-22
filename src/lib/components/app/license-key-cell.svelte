<script lang="ts">
  import { Copy } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  import { m } from "$lib/paraglide/messages";

  let { key }: { key: string } = $props();

  let copied = $state(false);
  let hovering = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  const masked = "***************************";

  function copyKey() {
    navigator.clipboard.writeText(key).then(() => {
      copied = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => (copied = false), 1000);
    });
  }
</script>

<div
  class="relative w-fit"
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onfocus={() => (hovering = true)}
  onblur={() => (hovering = false)}
  ontouchstart={() => (hovering = true)}
  role="none"
>
  <button
    type="button"
    class="relative cursor-pointer overflow-hidden rounded bg-gray-50 px-2 font-mono text-sm tabular-nums"
    onclick={copyKey}
  >
    <span class={hovering ? "invisible" : ""}>{masked}</span>

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

  {#if hovering && !copied}
    <span
      transition:fade={{ duration: 100 }}
      class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center rounded bg-gray-50 px-2 font-mono text-sm whitespace-nowrap tabular-nums"
    >
      {key}
    </span>
  {/if}
</div>
