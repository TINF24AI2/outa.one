<script lang="ts">
  import { Clock } from "@lucide/svelte";

  import LicenceList from "$lib/components/app/licence-list.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";

  let licenseHistory = []; // Placeholder for license history data
</script>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title="License History" subtitle="View your past license requests and their statuses." />

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#if licenseHistory.length === 0}
        <div
          class="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-center"
        >
          <Clock class="mb-4 h-8 w-8 text-gray-400" />
          <p class="text-sm text-gray-500">No license history found.</p>
        </div>
      {:else}
        <div>
          <LicenceList licenses={licenseHistory} />
        </div>
      {/if}
    </div>
  </div>
</div>
