<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, type AuditAction, type AuditEntityType } from "$lib/audit";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import StatusBadge from "$lib/components/app/status-badge.svelte";
  import * as Select from "$lib/components/ui/select";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";
  import { formatDateTime } from "$lib/user-management";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const locale = getLocale();

  // Initialise filter state from URL params. Cast is safe: values originate from our own navigation.
  // svelte-ignore state_referenced_locally
  let actionFilter = $state<AuditAction | "">((data.filters.action as AuditAction | null) ?? "");
  // svelte-ignore state_referenced_locally
  let entityTypeFilter = $state<AuditEntityType | "">((data.filters.entityType as AuditEntityType | null) ?? "");

  $effect(() => {
    const params = new URLSearchParams();
    if (actionFilter) {
      params.set("action", actionFilter);
    }
    if (entityTypeFilter) {
      params.set("entityType", entityTypeFilter);
    }
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    void goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
  });

  function paginationUrl(p: number) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams(page.url.searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  const ACTION_LABELS: Record<AuditAction, () => string> = {
    "license.created": m.audit_action_license_created,
    "license.deleted": m.audit_action_license_deleted,
    "license.user_assigned": m.audit_action_license_user_assigned,
    "license.user_unassigned": m.audit_action_license_user_unassigned,
    "product.created": m.audit_action_product_created,
    "product.updated": m.audit_action_product_updated,
    "product.deleted": m.audit_action_product_deleted,
    "user.invited": m.audit_action_user_invited,
    "user.invite_resent": m.audit_action_user_invite_resent,
    "user.invite_cancelled": m.audit_action_user_invite_cancelled,
    "user.role_updated": m.audit_action_user_role_updated,
    "user.removed": m.audit_action_user_removed,
    "license_request.submitted": m.audit_action_license_request_submitted,
  };

  const ACTION_VARIANTS: Record<AuditAction, "primary" | "secondary" | "success" | "warning" | "destructive"> = {
    "license.created": "primary",
    "license.deleted": "destructive",
    "license.user_assigned": "primary",
    "license.user_unassigned": "warning",
    "product.created": "primary",
    "product.updated": "secondary",
    "product.deleted": "destructive",
    "user.invited": "primary",
    "user.invite_resent": "secondary",
    "user.invite_cancelled": "warning",
    "user.role_updated": "secondary",
    "user.removed": "destructive",
    "license_request.submitted": "primary",
  };

  function getActionLabel(action: string) {
    return ACTION_LABELS[action as AuditAction]?.() ?? action;
  }

  function getActionVariant(action: string) {
    return ACTION_VARIANTS[action as AuditAction] ?? "secondary";
  }
</script>

<svelte:head>
  <title>{m.audit_meta_title()}</title>
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.audit_title()} subtitle={m.audit_subtitle()} />

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <!-- Filters -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">{m.audit_filter_action_label()}</span>
        <Select.Root type="single" bind:value={actionFilter}>
          <Select.Trigger size="sm">
            {actionFilter ? getActionLabel(actionFilter) : m.audit_filter_action_placeholder()}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="" label={m.audit_filter_action_placeholder()}>
              {m.audit_filter_action_placeholder()}
            </Select.Item>
            <Select.Separator />
            {#each AUDIT_ACTIONS as action (action)}
              <Select.Item value={action} label={getActionLabel(action)}>
                {getActionLabel(action)}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">{m.audit_filter_entity_type_label()}</span>
        <Select.Root type="single" bind:value={entityTypeFilter}>
          <Select.Trigger size="sm">
            {entityTypeFilter || m.audit_filter_entity_type_placeholder()}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="" label={m.audit_filter_entity_type_placeholder()}>
              {m.audit_filter_entity_type_placeholder()}
            </Select.Item>
            <Select.Separator />
            {#each AUDIT_ENTITY_TYPES as entityType (entityType)}
              <Select.Item value={entityType} label={entityType}>
                {entityType}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      {#if actionFilter || entityTypeFilter}
        <button
          class="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800"
          onclick={() => {
            actionFilter = "";
            entityTypeFilter = "";
          }}
        >
          {m.audit_filter_clear()}
        </button>
      {/if}
    </div>

    <div class="overflow-hidden rounded-lg border bg-white">
      {#if data.logs.length === 0}
        <p class="py-16 text-center text-sm text-gray-400">{m.audit_empty()}</p>
      {:else}
        <!-- Mobile card list -->
        <ul class="divide-y sm:hidden">
          {#each data.logs as log (log.id)}
            <li class="flex flex-col gap-2 p-4">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-gray-400">{formatDateTime(log.createdAt, locale)}</span>
                <StatusBadge variant={getActionVariant(log.action)}>{getActionLabel(log.action)}</StatusBadge>
              </div>
              <div class="text-sm">
                <span class="font-medium text-gray-900">{log.userName}</span>
              </div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p class="text-xs text-gray-400">{m.audit_table_entity_type()}</p>
                  <p class="text-gray-700">{log.entityType}</p>
                </div>
                {#if log.entityId}
                  <div>
                    <p class="text-xs text-gray-400">{m.audit_table_entity_id()}</p>
                    <p class="truncate font-mono text-xs text-gray-500">{log.entityId}</p>
                  </div>
                {/if}
                {#if log.ipAddress}
                  <div>
                    <p class="text-xs text-gray-400">{m.audit_table_ip_address()}</p>
                    <p class="font-mono text-xs text-gray-500">{log.ipAddress}</p>
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ul>

        <!-- Desktop table -->
        <div class="hidden sm:block">
          <Table.Root>
            <Table.Header class="bg-slate-50">
              <Table.Row class="[&>th]:text-neutral-500">
                <Table.Head class="pl-6">{m.audit_table_time()}</Table.Head>
                <Table.Head>{m.audit_table_actor()}</Table.Head>
                <Table.Head>{m.audit_table_action()}</Table.Head>
                <Table.Head>{m.audit_table_entity_type()}</Table.Head>
                <Table.Head>{m.audit_table_entity_id()}</Table.Head>
                <Table.Head class="pr-6">{m.audit_table_ip_address()}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.logs as log (log.id)}
                <Table.Row>
                  <Table.Cell class="py-3 pl-6 text-sm text-gray-500">
                    {formatDateTime(log.createdAt, locale)}
                  </Table.Cell>
                  <Table.Cell class="text-sm font-medium text-gray-900">
                    {log.userName}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge variant={getActionVariant(log.action)}>{getActionLabel(log.action)}</StatusBadge>
                  </Table.Cell>
                  <Table.Cell class="text-sm text-gray-600">{log.entityType}</Table.Cell>
                  <Table.Cell class="max-w-48 truncate font-mono text-xs text-gray-400">
                    {log.entityId ?? "—"}
                  </Table.Cell>
                  <Table.Cell class="pr-6 font-mono text-xs text-gray-400">
                    {log.ipAddress ?? "—"}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </div>

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
        <a
          href={data.pagination.page > 1 ? paginationUrl(data.pagination.page - 1) : undefined}
          class={`rounded-md border px-3 py-1.5 ${data.pagination.page <= 1 ? "pointer-events-none text-gray-300" : "hover:bg-gray-50"}`}
          aria-disabled={data.pagination.page <= 1}
        >
          {m.audit_pagination_previous()}
        </a>
        <span>
          {m.audit_pagination_info({ page: data.pagination.page, totalPages: data.pagination.totalPages })}
        </span>
        <a
          href={data.pagination.page < data.pagination.totalPages ? paginationUrl(data.pagination.page + 1) : undefined}
          class={`rounded-md border px-3 py-1.5 ${data.pagination.page >= data.pagination.totalPages ? "pointer-events-none text-gray-300" : "hover:bg-gray-50"}`}
          aria-disabled={data.pagination.page >= data.pagination.totalPages}
        >
          {m.audit_pagination_next()}
        </a>
      </div>
      <!-- eslint-enable svelte/no-navigation-without-resolve -->
    {/if}
  </div>
</div>
