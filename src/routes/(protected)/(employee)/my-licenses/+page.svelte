<script lang="ts">
  import { Clock } from "@lucide/svelte";

  import LicenceList from "$lib/components/app/licence-list.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import { m } from "$lib/paraglide/messages";

  let { data } = $props();
</script>

<svelte:head>
  <title>{m.history_meta_title()}</title>
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.history_title()} subtitle={m.history_subtitle()} />

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    {#if data.history.length === 0}
      <div class="overflow-hidden rounded-lg border bg-white">
        <div class="flex flex-col items-center gap-3 py-16 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Clock class="h-6 w-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-500">{m.history_empty_requests()}</p>
        </div>
      </div>
    {:else}
      <LicenceList licenses={data.history} />
    {/if}
  </div>
</div>
