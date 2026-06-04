<script lang="ts">
  import { Eye, EyeOff } from "@lucide/svelte";
  import { SvelteSet } from "svelte/reactivity";

  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";

  import * as Table from "../ui/table";
  import StatusBadge from "./status-badge.svelte";

  type LicenseEntry = {
    id: string;
    productName: string;
    licenceKey: string | null;
    requestedAt: Date | string;
    status: string;
    rejectionReason?: string | null;
  };

  type Props = {
    licenses: LicenseEntry[];
  };

  let { licenses }: Props = $props();

  const assigned = $derived(licenses.filter((l) => l.status === "active" || l.status === "approved"));
  const requests = $derived(licenses.filter((l) => l.status === "pending" || l.status === "rejected"));

  let visibleKeys = $state(new Set<string>());

  function toggleKey(id: string) {
    const next = new SvelteSet(visibleKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    visibleKeys = next;
  }

  const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    active: "success",
    approved: "success",
    pending: "warning",
    rejected: "destructive",
  };

  const statusLabel = $derived.by(
    (): Record<string, string> => ({
      active: m.history_status_active(),
      approved: m.history_status_approved(),
      pending: m.history_status_pending(),
      rejected: m.history_status_rejected(),
    }),
  );

  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat(getLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }
</script>

<div class="flex flex-col gap-6">
  {#if requests.length > 0}
    <div class="mt-6 hidden sm:block">
      <p class="text-xl leading-7 font-semibold">{m.history_section_requests()}</p>
    </div>
    <div class="overflow-hidden rounded-lg border bg-white">
      <!-- Mobile cards -->
      <ul class="divide-y border-t sm:hidden">
        {#each requests as license (license.id)}
          <li class="flex flex-col gap-2 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="font-semibold text-gray-900">{license.productName}</p>
              <StatusBadge variant={statusVariant[license.status] ?? "secondary"}>
                {statusLabel[license.status] ?? license.status}
              </StatusBadge>
            </div>
            {#if license.status === "rejected" && license.rejectionReason}
              <p class="text-xs text-gray-500">{license.rejectionReason}</p>
            {/if}
            <p class="text-xs text-gray-400">{formatDate(license.requestedAt)}</p>
          </li>
        {/each}
      </ul>

      <!-- Desktop table -->
      <div class="hidden sm:block">
        <Table.Root>
          <Table.Header class="bg-slate-50">
            <Table.Row class="[&>th]:text-neutral-500">
              <Table.Head class="pl-6">{m.history_table_product()}</Table.Head>
              <Table.Head>{m.history_table_date_requested()}</Table.Head>
              <Table.Head class="pr-6">{m.history_table_status()}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each requests as license (license.id)}
              <Table.Row>
                <Table.Cell class="font-inter py-3 pl-6 text-base leading-6 font-medium tracking-normal">
                  {license.productName}
                </Table.Cell>
                <Table.Cell class="text-gray-500">{formatDate(license.requestedAt)}</Table.Cell>
                <Table.Cell class="pr-6">
                  <StatusBadge variant={statusVariant[license.status] ?? "secondary"}>
                    {statusLabel[license.status] ?? license.status}
                  </StatusBadge>
                  {#if license.status === "rejected" && license.rejectionReason}
                    <p class="mt-1 text-xs text-gray-500">{license.rejectionReason}</p>
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  {/if}

  <!-- Assigned Licenses -->
  <div class="mt-6 hidden sm:block">
    <p class="text-xl leading-7 font-semibold">{m.history_section_assigned()}</p>
  </div>
  <div class="overflow-hidden rounded-lg border bg-white">
    {#if assigned.length === 0}
      <div class="flex flex-col items-center gap-3 py-16 text-center">
        <p class="text-sm text-gray-500">{m.history_empty_assigned()}</p>
      </div>
    {:else}
      <!-- Mobile cards -->
      <ul class="divide-y sm:hidden">
        {#each assigned as license (license.id)}
          <li class="flex flex-col gap-2 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="font-semibold text-gray-900">{license.productName}</p>
              <StatusBadge variant={statusVariant[license.status] ?? "secondary"}>
                {statusLabel[license.status] ?? license.status}
              </StatusBadge>
            </div>
            <div class="flex items-center gap-2">
              <p class="font-mono text-xs text-gray-500">
                {visibleKeys.has(license.id) ? (license.licenceKey ?? "—") : "••••••••••••••••"}
              </p>
              {#if license.licenceKey}
                <button
                  type="button"
                  onclick={() => toggleKey(license.id)}
                  class="text-gray-400 hover:text-gray-600"
                  aria-label={visibleKeys.has(license.id) ? m.licenses_key_hide() : m.licenses_key_show()}
                >
                  {#if visibleKeys.has(license.id)}
                    <EyeOff class="h-3.5 w-3.5" />
                  {:else}
                    <Eye class="h-3.5 w-3.5" />
                  {/if}
                </button>
              {/if}
            </div>
            <p class="text-xs text-gray-400">{formatDate(license.requestedAt)}</p>
          </li>
        {/each}
      </ul>

      <!-- Desktop table -->
      <div class="hidden sm:block">
        <Table.Root>
          <Table.Header class="bg-slate-50">
            <Table.Row class="[&>th]:text-neutral-500">
              <Table.Head class="pl-6">{m.history_table_product()}</Table.Head>
              <Table.Head>{m.history_table_license_key()}</Table.Head>
              <Table.Head>{m.history_table_date_assigned()}</Table.Head>
              <Table.Head class="pr-6">{m.history_table_status()}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each assigned as license (license.id)}
              <Table.Row>
                <Table.Cell class="font-inter py-3 pl-6 text-base leading-6 font-medium tracking-normal">
                  {license.productName}
                </Table.Cell>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-sm text-gray-500">
                      {visibleKeys.has(license.id) ? (license.licenceKey ?? "—") : "••••••••••••••••"}
                    </span>
                    {#if license.licenceKey}
                      <button
                        type="button"
                        onclick={() => toggleKey(license.id)}
                        class="text-gray-400 hover:text-gray-600"
                        aria-label={visibleKeys.has(license.id) ? m.licenses_key_hide() : m.licenses_key_show()}
                      >
                        {#if visibleKeys.has(license.id)}
                          <EyeOff class="h-4 w-4" />
                        {:else}
                          <Eye class="h-4 w-4" />
                        {/if}
                      </button>
                    {/if}
                  </div>
                </Table.Cell>
                <Table.Cell class="text-gray-500">{formatDate(license.requestedAt)}</Table.Cell>
                <Table.Cell class="pr-6">
                  <StatusBadge variant={statusVariant[license.status] ?? "secondary"}>
                    {statusLabel[license.status] ?? license.status}
                  </StatusBadge>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  </div>

  <!-- License Requests -->
</div>
