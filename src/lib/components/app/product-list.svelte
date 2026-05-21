<script lang="ts">
  import { KeyRound, Package, UploadIcon } from "@lucide/svelte";
  import type { Infer, SuperValidated } from "sveltekit-superforms";

  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages.js";
  import { deleteProductSchema, updateProductSchema } from "$lib/schemas/products";

  import DeleteProduct from "./delete-product.svelte";
  import EditProduct from "./edit-product.svelte";
  import StatusBadge from "./status-badge.svelte";

  type ProductListItem = {
    id: string;
    name: string;
    description: string | null;
    requiresApproval: boolean;
    maxLicensesPerUser: number;
    licenseCount: number;
    maxUsageVolume: number;
    totalSeats: number;
    assignedSeats: number;
    availableSeats: number;
  };

  type Props = {
    products: ProductListItem[];
    editForms: SuperValidated<Infer<typeof updateProductSchema>>[];
    deleteForms: SuperValidated<Infer<typeof deleteProductSchema>>[];
  };

  let { products, editForms, deleteForms }: Props = $props();

  const editFormsById = $derived(Object.fromEntries(editForms.map((form) => [form.data.productId, form])));
  const deleteFormsById = $derived(Object.fromEntries(deleteForms.map((form) => [form.data.productId, form])));

  function licenseTypeLabel(product: ProductListItem): string {
    return product.maxUsageVolume > 1 ? m.licenses_table_type_volume() : m.licenses_table_type_single();
  }

  function availabilityClasses(availableKeys: number): string {
    if (availableKeys === 0) return "bg-red-50 text-red-700";
    if (availableKeys < 3) return "bg-orange-50 text-orange-700";
    return "bg-green-50 text-green-700";
  }
</script>

{#snippet productActions(product: ProductListItem)}
  <div class="flex items-center gap-0.5">
    <Button
      variant="ghost"
      size="icon-sm"
      href={`/admin/licenses?product=${product.id}`}
      title={m.products_action_view_licenses()}
    >
      <KeyRound class="h-4 w-4 text-gray-500" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      href={`/admin/licenses?add=1&addProduct=${product.id}`}
      title={m.products_action_add_license()}
    >
      <UploadIcon class="h-4 w-4 text-gray-500" />
    </Button>
    <EditProduct {product} form={editFormsById[product.id]} />
    <DeleteProduct {product} form={deleteFormsById[product.id]} />
  </div>
{/snippet}

<div class="overflow-hidden rounded-lg border bg-white">
  {#if products.length === 0}
    <div class="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p class="text-sm font-medium text-gray-900">{m.products_empty_title()}</p>
      <p class="max-w-md text-sm text-gray-500">{m.products_empty_description()}</p>
    </div>
  {:else}
    <ul class="divide-y sm:hidden">
      {#each products as product (product.id)}
        <li class="flex flex-col gap-4 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Package class="h-5 w-5 text-slate-600" />
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold text-gray-900">{product.name}</p>
                {#if product.description}
                  <p class="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
                {/if}
                {#if product.requiresApproval}
                  <div class="pt-2">
                    <StatusBadge variant="warning">{m.products_requires_approval_badge()}</StatusBadge>
                  </div>
                {/if}
              </div>
            </div>
            <span
              class={`inline-flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-medium ${availabilityClasses(product.availableSeats)}`}
            >
              {m.products_table_available_count({ count: product.availableSeats })}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p class="text-xs text-gray-400">{m.licenses_table_type()}</p>
              <div class="pt-1">
                <StatusBadge variant="secondary">{licenseTypeLabel(product)}</StatusBadge>
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-400">{m.products_table_total_keys()}</p>
              <p class="text-gray-700">{product.totalSeats}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">{m.products_table_used_keys()}</p>
              <p class="text-gray-700">{product.assignedSeats}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">{m.products_table_available_keys()}</p>
              <span
                class={`inline-flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-medium ${availabilityClasses(product.availableSeats)}`}
              >
                {product.availableSeats}
              </span>
            </div>
          </div>

          <div>{@render productActions(product)}</div>
        </li>
      {/each}
    </ul>

    <div class="hidden sm:block">
      <Table.Root>
        <Table.Header class="bg-slate-50">
          <Table.Row class="[&>th]:text-neutral-500">
            <Table.Head class="pl-6">{m.products_table_product()}</Table.Head>
            <Table.Head>{m.licenses_table_type()}</Table.Head>
            <Table.Head>{m.products_table_total_keys()}</Table.Head>
            <Table.Head>{m.products_table_used_keys()}</Table.Head>
            <Table.Head>{m.products_table_available_keys()}</Table.Head>
            <Table.Head class="pr-6">{m.licenses_table_actions()}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each products as product (product.id)}
            <Table.Row>
              <Table.Cell class="py-3 pl-6">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Package class="h-5 w-5 text-slate-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900">{product.name}</p>
                    {#if product.description}
                      <p class="mt-0.5 max-w-md truncate text-sm text-gray-500">{product.description}</p>
                    {/if}
                    {#if product.requiresApproval}
                      <div class="pt-2">
                        <StatusBadge variant="warning">{m.products_requires_approval_badge()}</StatusBadge>
                      </div>
                    {/if}
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge variant="secondary">{licenseTypeLabel(product)}</StatusBadge>
              </Table.Cell>
              <Table.Cell class="text-gray-700">{product.totalSeats}</Table.Cell>
              <Table.Cell class="text-gray-700">{product.assignedSeats}</Table.Cell>
              <Table.Cell>
                <span
                  class={`inline-flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-medium ${availabilityClasses(product.availableSeats)}`}
                >
                  {product.availableSeats}
                </span>
              </Table.Cell>
              <Table.Cell class="pr-6 text-left">
                {@render productActions(product)}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
</div>
