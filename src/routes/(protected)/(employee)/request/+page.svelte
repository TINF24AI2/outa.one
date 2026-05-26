<script lang="ts">
  import { Box, Clock, Search } from "@lucide/svelte";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import RequestLicenseForm from "$lib/components/app/request-license-form.svelte";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/paraglide/messages.js";

  let { data } = $props();

  type Product = (typeof data.products)[0];

  let search = $state("");
  let selectedProduct = $state<Product | null>(null);
  let dialogOpen = $state(false);

  const filteredProducts = $derived(
    search.trim()
      ? data.products.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase()),
        )
      : data.products,
  );

  function openRequest(product: Product) {
    selectedProduct = product;
    dialogOpen = true;
  }

  function availableBadgeClass(available: number) {
    if (available === 0) return "bg-red-50 text-red-700";
    if (available <= 3) return "bg-amber-50 text-amber-700";
    return "bg-green-50 text-green-700";
  }

  function availableDotClass(available: number) {
    if (available === 0) return "bg-red-500";
    if (available <= 3) return "bg-amber-500";
    return "bg-green-500";
  }
</script>

<svelte:head>
  <title>{m.request_meta_title()}</title>
  <meta name="description" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title="{m.home_title()}, {data.user.name.split(' ')[0]}" subtitle={m.request_subtitle()} />

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    <div class="relative mb-6">
      <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input type="search" placeholder={m.request_search_placeholder()} bind:value={search} class="pl-9" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filteredProducts as product (product.id)}
        {@const atUserLimit = product.maxLicensesPerUser > 0 && product.userHeld >= product.maxLicensesPerUser}
        {@const noLicenses = product.available === 0}
        {@const canRequest = !atUserLimit && !noLicenses}

        <div class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
          <div class="flex items-start justify-between">
            <div class="flex h-11 w-11 items-center justify-center rounded-md bg-blue-100">
              <Box class="h-5 w-5 text-blue-500" />
            </div>
            {#if product.requiresApproval}
              <div
                class="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
              >
                <Clock class="h-3 w-3" />
                {m.request_requires_approval_badge()}
              </div>
            {/if}
          </div>

          <div class="flex-1">
            <p class="font-semibold text-gray-900">{product.name}</p>
            {#if product.description}
              <p class="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
            {/if}
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <div
                class={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${availableBadgeClass(product.available)}`}
              >
                <span class={`h-1.5 w-1.5 rounded-full ${availableDotClass(product.available)}`}></span>
                {product.available === -1
                  ? m.request_dialog_type_volume()
                  : m.request_available({ count: product.available })}
              </div>
              <span class="text-xs text-gray-500">
                {product.maxLicensesPerUser > 0
                  ? m.request_held_limited({ held: product.userHeld, max: product.maxLicensesPerUser })
                  : m.request_held({ held: product.userHeld })}
              </span>
            </div>
          </div>

          {#if canRequest}
            <button
              onclick={() => openRequest(product)}
              class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {m.request_button()}
            </button>
          {:else if atUserLimit}
            <button
              disabled
              class="w-full cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400"
            >
              {m.request_limit_reached()}
            </button>
          {:else}
            <button
              disabled
              class="w-full cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400"
            >
              {m.request_unavailable()}
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<RequestLicenseForm bind:open={dialogOpen} product={selectedProduct} initialForm={data.form} />
