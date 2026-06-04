<script lang="ts">
  import { History } from "@lucide/svelte";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import StatusBadge from "$lib/components/app/status-badge.svelte";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";

  import type { LicenseAction } from "./+page.server";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const eventLabel = $derived.by(
    (): Record<LicenseAction, string> => ({
      "license_request.submitted": m.license_history_event_submitted(),
      "license_request.approved": m.license_history_event_approved(),
      "license_request.rejected": m.license_history_event_rejected(),
      "license.user_assigned": m.license_history_event_assigned(),
      "license.user_unassigned": m.license_history_event_unassigned(),
    }),
  );

  const eventVariant: Record<LicenseAction, "success" | "warning" | "destructive" | "secondary"> = {
    "license_request.submitted": "secondary",
    "license_request.approved": "success",
    "license_request.rejected": "destructive",
    "license.user_assigned": "success",
    "license.user_unassigned": "destructive",
  };

  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat(getLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: getLocale().startsWith("en"),
    }).format(new Date(date));
  }

  function getDetails(action: LicenseAction, metadata: Record<string, string> | null): string | null {
    if (!metadata) return null;
    if (action === "license_request.rejected" && metadata.reason) return metadata.reason;
    if (
      (action === "license_request.approved" ||
        action === "license.user_assigned" ||
        action === "license.user_unassigned") &&
      metadata.licenseKey
    ) {
      return metadata.licenseKey;
    }
    return null;
  }
</script>

<svelte:head>
  <title>{m.license_history_meta_title()}</title>
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.license_history_title()} subtitle={m.license_history_subtitle()} />

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    <div class="overflow-hidden rounded-lg border bg-white">
      <div class="mt-6 mb-6 hidden sm:block sm:px-6">
        <p class="text-xl leading-7 font-semibold">{m.license_history_title()}</p>
        <p class="mb-1 text-xs text-gray-500 sm:text-sm">{data.events.length} {m.license_history_subtitle()}</p>
      </div>

      {#if data.events.length === 0}
        <div class="flex flex-col items-center gap-3 border-t py-16 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <History class="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{m.license_history_empty_title()}</p>
            <p class="mt-1 text-sm text-gray-500">{m.license_history_empty_subtitle()}</p>
          </div>
        </div>
      {:else}
        <!-- Mobile list -->
        <ul class="divide-y border-t sm:hidden">
          {#each data.events as event (event.id)}
            {@const details = getDetails(event.action, event.metadata)}
            <li class="flex flex-col gap-2 p-4">
              <div class="flex items-start justify-between gap-3">
                <p class="font-semibold text-gray-900">{event.metadata?.productName ?? "—"}</p>
                <StatusBadge variant={eventVariant[event.action]}>
                  {eventLabel[event.action]}
                </StatusBadge>
              </div>
              {#if details}
                <p class="font-mono text-xs text-gray-500">{details}</p>
              {/if}
              <p class="text-xs text-gray-400">{formatDate(event.createdAt)}</p>
            </li>
          {/each}
        </ul>

        <!-- Desktop table -->
        <div class="hidden border-t sm:block">
          <Table.Root>
            <Table.Header class="bg-slate-50">
              <Table.Row class="[&>th]:text-neutral-500">
                <Table.Head class="pl-6">{m.license_history_table_event()}</Table.Head>
                <Table.Head>{m.license_history_table_product()}</Table.Head>
                <Table.Head>{m.license_history_table_details()}</Table.Head>
                <Table.Head class="pr-6">{m.license_history_table_date()}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.events as event (event.id)}
                {@const details = getDetails(event.action, event.metadata)}
                <Table.Row>
                  <Table.Cell class="py-3 pl-6">
                    <StatusBadge variant={eventVariant[event.action]}>
                      {eventLabel[event.action]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell class="font-inter text-base leading-6 font-medium tracking-normal">
                    {event.metadata?.productName ?? "—"}
                  </Table.Cell>
                  <Table.Cell class="font-mono text-sm text-gray-500">
                    {details ?? "—"}
                  </Table.Cell>
                  <Table.Cell class="pr-6 text-gray-500">{formatDate(event.createdAt)}</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </div>
  </div>
</div>
