<script lang="ts">
  import { BarChart3, Download, FileText } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import { type AuditAction } from "$lib/audit";
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

  // svelte-ignore state_referenced_locally
  let productId = $state(data.filters.productId ?? "");
  // svelte-ignore state_referenced_locally
  let userSearch = $state(data.filters.userSearch ?? "");
  // svelte-ignore state_referenced_locally
  let dateFrom = $state(data.filters.dateFrom ?? "");
  // svelte-ignore state_referenced_locally
  let dateTo = $state(data.filters.dateTo ?? "");

  let userSearchTimeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (userSearch) params.set("userSearch", userSearch);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    void goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
  });

  function onUserSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    clearTimeout(userSearchTimeout);
    userSearchTimeout = setTimeout(() => {
      userSearch = val;
    }, 300);
  }

  function paginationUrl(p: number) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams(page.url.searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  function clearFilters() {
    productId = "";
    userSearch = "";
    dateFrom = "";
    dateTo = "";
  }

  const hasFilters = $derived(!!productId || !!userSearch || !!dateFrom || !!dateTo);

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
    "license_request.approved": m.audit_action_license_request_approved,
    "license_request.rejected": m.audit_action_license_request_rejected,
  };

  const ACTION_VARIANTS: Record<AuditAction, "primary" | "secondary" | "success" | "warning" | "destructive"> = {
    "license.created": "primary",
    "license.deleted": "destructive",
    "license.user_assigned": "success",
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
    "license_request.approved": "success",
    "license_request.rejected": "destructive",
  };

  function getActionLabel(action: string) {
    return ACTION_LABELS[action as AuditAction]?.() ?? action;
  }

  function getActionVariant(action: string) {
    return ACTION_VARIANTS[action as AuditAction] ?? "secondary";
  }

  // Chart helpers
  const maxCount = $derived(Math.max(...data.chartData.map((d: { count: number }) => d.count), 1));

  function csvExportUrl() {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams(page.url.searchParams);
    params.delete("page");
    return `${resolve("/admin/reports/export.csv")}?${params.toString()}`;
  }

  function pdfExportUrl() {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const params = new URLSearchParams(page.url.searchParams);
    params.delete("page");
    return `${resolve("/admin/reports/export.pdf")}?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>{m.reports_meta_title()}</title>
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.reports_title()} subtitle={m.reports_subtitle()}>
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <div class="flex items-center gap-2">
      <a
        href={csvExportUrl()}
        download
        class="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Download class="h-4 w-4" />
        {m.reports_export_csv()}
      </a>
      <a
        href={pdfExportUrl()}
        download
        class="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <FileText class="h-4 w-4" />
        {m.reports_export_pdf()}
      </a>
    </div>
    <!-- eslint-enable svelte/no-navigation-without-resolve -->
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <!-- Bar Chart -->
    <div class="mb-5 overflow-hidden rounded-lg border bg-white">
      <div class="flex items-center gap-2 px-6 py-4">
        <BarChart3 class="text-primary h-5 w-5" />
        <h3 class="font-semibold text-gray-900">{m.reports_chart_title()}</h3>
      </div>

      {#if data.chartData.length === 0}
        <p class="pb-12 text-center text-sm text-gray-400">No assignment data yet.</p>
      {:else}
        <div class="px-6 pb-6">
          <!-- SVG bar chart -->
          {#snippet barChart()}
            {@const chartHeight = 200}
            {@const barGap = 12}
            {@const barCount = data.chartData.length}
            {@const svgPaddingLeft = 36}
            {@const svgPaddingBottom = 40}
            {@const svgPaddingTop = 24}

            <svg
              viewBox="0 0 800 {chartHeight + svgPaddingBottom + svgPaddingTop}"
              class="w-full"
              aria-label={m.reports_chart_title()}
            >
              <!-- Y-axis gridlines & labels -->
              {#each [0, 0.25, 0.5, 0.75, 1] as frac (frac)}
                {@const y = svgPaddingTop + chartHeight - frac * chartHeight}
                {@const value = Math.round(frac * maxCount)}
                <line x1={svgPaddingLeft} x2="800" y1={y} y2={y} stroke="#e5e7eb" stroke-width="1" />
                <text x={svgPaddingLeft - 4} y={y + 4} text-anchor="end" font-size="11" fill="#9ca3af">
                  {value}
                </text>
              {/each}

              <!-- Bars -->
              {#each data.chartData as item, i (item.productName)}
                {@const totalBarArea = 800 - svgPaddingLeft}
                {@const barWidth = Math.max(20, totalBarArea / barCount - barGap)}
                {@const x = svgPaddingLeft + i * (barWidth + barGap) + barGap / 2}
                {@const barH = (item.count / maxCount) * chartHeight}
                {@const y = svgPaddingTop + chartHeight - barH}

                <rect {x} {y} width={barWidth} height={barH} rx="3" fill="#3b82f6" />
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  text-anchor="middle"
                  font-size="11"
                  font-weight="600"
                  fill="#374151"
                >
                  {item.count}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={svgPaddingTop + chartHeight + svgPaddingBottom - 8}
                  text-anchor="middle"
                  font-size="11"
                  fill="#6b7280"
                >
                  {item.productName.length > 12 ? item.productName.slice(0, 12) + "…" : item.productName}
                </text>
              {/each}
            </svg>
          {/snippet}
          <div class="relative">
            {@render barChart()}
          </div>
        </div>
      {/if}
    </div>

    <!-- Filters -->
    <div class="mb-5 overflow-hidden rounded-lg border bg-white">
      <div class="px-6 py-4">
        <h3 class="font-semibold text-gray-900">{m.reports_filter_title()}</h3>
      </div>
      <div class="flex flex-wrap items-end gap-4 border-t px-6 py-4">
        <!-- Date from -->
        <div class="flex flex-col gap-1">
          <label for="dateFrom" class="text-xs font-medium text-gray-500">{m.reports_filter_date_from()}</label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            oninput={(e) => (dateFrom = (e.target as HTMLInputElement).value)}
            class="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <!-- Date to -->
        <div class="flex flex-col gap-1">
          <label for="dateTo" class="text-xs font-medium text-gray-500">{m.reports_filter_date_to()}</label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            oninput={(e) => (dateTo = (e.target as HTMLInputElement).value)}
            class="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <!-- Product -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500">Product</span>
          <Select.Root type="single" bind:value={productId}>
            <Select.Trigger size="sm" class="w-44">
              {productId
                ? (data.products.find((p: { id: string; name: string }) => p.id === productId)?.name ??
                  m.reports_filter_product_placeholder())
                : m.reports_filter_product_placeholder()}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="" label={m.reports_filter_product_placeholder()}>
                {m.reports_filter_product_placeholder()}
              </Select.Item>
              <Select.Separator />
              {#each data.products as p (p.id)}
                <Select.Item value={p.id} label={p.name}>{p.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <!-- User search -->
        <div class="flex flex-col gap-1">
          <label for="userSearch" class="text-xs font-medium text-gray-500">Search User</label>
          <div class="relative">
            <input
              id="userSearch"
              type="text"
              value={userSearch}
              oninput={onUserSearchInput}
              placeholder={m.reports_filter_user_placeholder()}
              class="w-48 rounded-md border border-gray-200 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {#if hasFilters}
          <button
            type="button"
            onclick={clearFilters}
            class="self-end text-xs text-gray-400 hover:text-gray-600 hover:underline"
          >
            {m.reports_filter_clear()}
          </button>
        {/if}
      </div>
    </div>

    <!-- Activity Log -->
    <div class="overflow-hidden rounded-lg border bg-white">
      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <h3 class="font-semibold text-gray-900">{m.reports_log_title()}</h3>
          <p class="mt-0.5 text-sm text-gray-400">
            {m.reports_log_records({ count: data.pagination.total })}
          </p>
        </div>
      </div>

      {#if data.logs.length === 0}
        <p class="py-16 text-center text-sm text-gray-400">{m.reports_empty()}</p>
      {:else}
        <!-- Mobile card list -->
        <ul class="divide-y sm:hidden">
          {#each data.logs as log (log.id)}
            <li class="flex flex-col gap-2 p-4">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-gray-400">{formatDateTime(log.createdAt, locale)}</span>
                <StatusBadge variant={getActionVariant(log.action)}>{getActionLabel(log.action)}</StatusBadge>
              </div>
              <p class="text-sm font-medium text-gray-900">{log.userName}</p>
              {#if log.productName}
                <p class="text-sm text-gray-600">{log.productName}</p>
              {/if}
              {#if log.licenseKey}
                <p class="truncate font-mono text-xs text-gray-400">{log.licenseKey.slice(0, 6)}••••••••</p>
              {/if}
            </li>
          {/each}
        </ul>

        <!-- Desktop table -->
        <div class="hidden sm:block">
          <Table.Root>
            <Table.Header class="bg-slate-50">
              <Table.Row class="[&>th]:text-neutral-500">
                <Table.Head class="pl-6">{m.reports_table_timestamp()}</Table.Head>
                <Table.Head>{m.reports_table_user()}</Table.Head>
                <Table.Head>{m.reports_table_product()}</Table.Head>
                <Table.Head>{m.reports_table_license_key()}</Table.Head>
                <Table.Head class="pr-6">{m.reports_table_action()}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.logs as log (log.id)}
                <Table.Row>
                  <Table.Cell class="py-3 pl-6 text-sm text-gray-500">
                    {formatDateTime(log.createdAt, locale)}
                  </Table.Cell>
                  <Table.Cell class="text-sm font-medium text-gray-900">{log.userName}</Table.Cell>
                  <Table.Cell class="text-sm text-gray-600">{log.productName ?? "—"}</Table.Cell>
                  <Table.Cell>
                    {#if log.licenseKey}
                      <span class="font-mono text-xs text-gray-400">
                        {log.licenseKey.slice(0, 4)}••••••••••••
                      </span>
                    {:else}
                      <span class="text-gray-300">—</span>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="pr-6">
                    <StatusBadge variant={getActionVariant(log.action)}>{getActionLabel(log.action)}</StatusBadge>
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
