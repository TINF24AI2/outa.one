<script lang="ts">
  import { X } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import AddLicenseDialog from "$lib/components/app/add-license-dialog.svelte";
  import AssignUserDialog from "$lib/components/app/assign-user-dialog.svelte";
  import DeleteLicense from "$lib/components/app/delete-license.svelte";
  import LicenseKeyCell from "$lib/components/app/license-key-cell.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import StatusBadge from "$lib/components/app/status-badge.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages.js";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const deleteForms = $derived(Object.fromEntries(data.deleteForms.map((f) => [f.data.licenseId, f])));

  // Filter state — initialised from URL so the page is bookmarkable / shareable
  let productFilter = $state(page.url.searchParams.get("product") ?? "");
  let userFilter = $state(page.url.searchParams.get("user") ?? "");

  const productOptions = $derived(data.products.map((p) => ({ value: p.id, label: p.name })));
  const userOptions = $derived(data.users.map((u) => ({ value: u.id, label: u.name })));

  async function syncUrl() {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams();
    if (productFilter) params.set("product", productFilter);
    if (userFilter) params.set("user", userFilter);
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    await goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  $effect(() => {
    void productFilter;
    void userFilter;
    syncUrl();
  });

  function clearProduct() {
    productFilter = "";
  }

  function clearUser() {
    userFilter = "";
  }

  const activeFilters = $derived(
    [
      productFilter
        ? {
            key: "product",
            label: `${m.licenses_filters_product_label()}: ${data.products.find((p) => p.id === productFilter)?.name ?? productFilter}`,
            clear: clearProduct,
          }
        : null,
      userFilter
        ? {
            key: "user",
            label: `${m.licenses_filters_user_label()}: ${userOptions.find((u) => u.value === userFilter)?.label ?? userFilter}`,
            clear: clearUser,
          }
        : null,
    ].filter((f) => f !== null),
  );

  const filteredLicenses = $derived(
    data.licenses.filter((lic) => {
      if (productFilter && lic.productId !== productFilter) return false;
      // userFilter will be wired up once user–license assignment is implemented
      return true;
    }),
  );

  const totalCount = $derived(filteredLicenses.length);
  const assignedCount = $derived(0); // placeholder until user assignment is implemented
  const availableCount = $derived(totalCount - assignedCount);

  function licenseTypeLabel(usageVolume: number): string {
    return usageVolume === 1 ? m.licenses_table_type_single() : m.licenses_table_type_volume();
  }
</script>

<svelte:head>
  <title>{m.licenses_popup_add_meta_title()}</title>
  <meta name="licenses" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.licenses_title()} subtitle={m.licenses_subtitle()}>
    <AddLicenseDialog form={data.form} products={data.products} />
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <div class="flex flex-col gap-4">
      <!-- Filters card -->
      <div class="rounded-lg border bg-white p-5">
        <p class="mb-4 font-semibold">{m.licenses_filters_title()}</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" for="filter-product">
              {m.licenses_filters_product_label()}
            </label>
            <Combobox
              id="filter-product"
              bind:value={productFilter}
              options={productOptions}
              placeholder={m.licenses_filters_product_placeholder()}
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" for="filter-user">
              {m.licenses_filters_user_label()}
            </label>
            <Combobox
              id="filter-user"
              bind:value={userFilter}
              options={userOptions}
              placeholder={m.licenses_filters_user_placeholder()}
            />
          </div>
        </div>

        {#if activeFilters.length > 0}
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500">{m.licenses_filters_active()}</span>
            {#each activeFilters as filter (filter.key)}
              <button
                type="button"
                onclick={filter.clear}
                class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                {filter.label}
                <X class="h-3 w-3" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-lg border bg-white p-5">
          <p class="text-sm text-gray-500">{m.licenses_stats_total()}</p>
          <p class="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div class="rounded-lg border bg-white p-5">
          <p class="text-sm text-gray-500">{m.licenses_stats_assigned()}</p>
          <p class="mt-1 text-3xl font-bold text-blue-600">{assignedCount}</p>
        </div>
        <div class="rounded-lg border bg-white p-5">
          <p class="text-sm text-gray-500">{m.licenses_stats_available()}</p>
          <p class="mt-1 text-3xl font-bold text-green-600">{availableCount}</p>
        </div>
      </div>

      <!-- Licenses table -->
      <div class="overflow-hidden rounded-lg border bg-white">
        {#snippet licenseActions(lic: (typeof filteredLicenses)[number])}
          <div class="flex items-center gap-0.5">
            <AssignUserDialog
              licenseId={lic.id}
              productName={lic.productName ?? "—"}
              usageVolume={lic.usageVolume}
              {userOptions}
            />
            <DeleteLicense licenseId={lic.id} productName={lic.productName ?? "—"} form={deleteForms[lic.id]} />
          </div>
        {/snippet}

        <!-- Mobile card list -->
        <ul class="divide-y sm:hidden">
          {#each filteredLicenses as lic (lic.id)}
            <li class="flex flex-col gap-3 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-gray-900">{lic.productName ?? "—"}</p>
                  <LicenseKeyCell key={lic.key} />
                </div>
                <StatusBadge variant="secondary">
                  {m.licenses_table_status_available()}
                </StatusBadge>
              </div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p class="text-xs text-gray-400">{m.licenses_table_assigned_to()}</p>
                  <p class="text-gray-500">—</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{m.licenses_table_type()}</p>
                  <p class="text-gray-500">{licenseTypeLabel(lic.usageVolume)}</p>
                </div>
              </div>
              <div class="flex justify-end">{@render licenseActions(lic)}</div>
            </li>
          {/each}
        </ul>

        <!-- Desktop table -->
        <div class="hidden sm:block">
          <Table.Root>
            <Table.Header class="bg-slate-50">
              <Table.Row class="[&>th]:text-neutral-500">
                <Table.Head class="pl-6">{m.licenses_table_product()}</Table.Head>
                <Table.Head>{m.licenses_table_key()}</Table.Head>
                <Table.Head>{m.licenses_table_status()}</Table.Head>
                <Table.Head>{m.licenses_table_assigned_to()}</Table.Head>
                <Table.Head>{m.licenses_table_type()}</Table.Head>
                <Table.Head>{m.licenses_table_actions()}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each filteredLicenses as lic (lic.id)}
                <Table.Row>
                  <Table.Cell class="py-3 pl-6">
                    <span class="font-semibold text-gray-900">{lic.productName ?? "—"}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <LicenseKeyCell key={lic.key} />
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge variant="success">
                      {m.licenses_table_status_available()}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell class="text-gray-500">—</Table.Cell>
                  <Table.Cell class="text-gray-500">
                    <StatusBadge variant="secondary">
                      {licenseTypeLabel(lic.usageVolume)}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell class="pr-6">
                    {@render licenseActions(lic)}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  </div>
</div>
