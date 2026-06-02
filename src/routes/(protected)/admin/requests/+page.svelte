<script lang="ts">
  import { ClipboardList } from "@lucide/svelte";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import RequestActions from "$lib/components/app/request-actions.svelte";
  import StatusBadge from "$lib/components/app/status-badge.svelte";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function availabilityVariant(n: number): "destructive" | "warning" | "success" {
    if (n === 0) return "destructive";
    if (n <= 5) return "warning";
    return "success";
  }

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
</script>

<svelte:head>
  <title>{m.requests_meta_title()}</title>
  <meta name="requests" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.requests_page_header()} subtitle={m.requests_page_subheader()}></PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    <div class="mb-6 rounded-lg border bg-white p-3 sm:p-5">
      <p class="text-xs text-gray-500 sm:text-sm">{m.requests_pending_requests()}</p>
      <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.requests.length}</p>
    </div>

    <div class="overflow-hidden rounded-lg border bg-white">
      <div class="mt-6 mb-6 hidden sm:block sm:px-6">
        <p class="text-xl leading-7 font-semibold">{m.requests_pending_requests()}</p>
        <p class="mb-1 text-xs text-gray-500 sm:text-sm">{data.requests.length} {m.requests_pending_requests_sub()}</p>
      </div>

      {#if data.requests.length === 0}
        <!-- Empty state -->
        <div class="flex flex-col items-center gap-3 border-t py-16 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <ClipboardList class="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{m.requests_empty_title()}</p>
            <p class="mt-1 text-sm text-gray-500">{m.requests_empty_subtitle()}</p>
          </div>
        </div>
      {:else}
        <!-- Mobile list -->
        <ul class="divide-y border-t sm:hidden">
          {#each data.requests as request, i (request.id)}
            <li class="flex flex-col gap-3 p-4">
              <div class="min-w-0">
                <p class="truncate font-semibold text-gray-900">{request.userName}</p>
                <p class="truncate text-sm text-gray-500">{request.email}</p>
              </div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p class="text-xs text-gray-400">{m.requests_product()}</p>
                  <p class="text-gray-700">{request.productName}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{m.requests_date()}</p>
                  <p class="text-gray-700">{formatDate(request.createdAt)}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">{m.requests_available()}</p>
                  <StatusBadge variant={availabilityVariant(request.availableUsage)}>
                    {request.availableUsage}
                  </StatusBadge>
                </div>
              </div>
              <RequestActions
                requestId={request.id}
                userName={request.userName}
                productName={request.productName}
                availableUsage={request.availableUsage}
                approveFormData={data.approveForms[i]}
                rejectFormData={data.rejectForms[i]}
              />
            </li>
          {/each}
        </ul>

        <!-- Desktop table -->
        <div class="hidden border-t sm:block">
          <Table.Root>
            <Table.Header class="bg-slate-50">
              <Table.Row class="[&>th]:text-neutral-500">
                <Table.Head class="pl-6">{m.requests_user()}</Table.Head>
                <Table.Head>{m.requests_product()}</Table.Head>
                <Table.Head>{m.requests_date()}</Table.Head>
                <Table.Head>{m.requests_available()}</Table.Head>
                <Table.Head class="pr-6">{m.requests_actions()}</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {#each data.requests as request, i (request.id)}
                <Table.Row>
                  <Table.Cell class="flex flex-col gap-1 py-3 pl-6">
                    <p class="font-inter text-base leading-6 font-medium tracking-normal">{request.userName}</p>
                    <p class="font-inter text-sm leading-5 font-normal tracking-normal text-gray-500">
                      {request.email}
                    </p>
                  </Table.Cell>
                  <Table.Cell class="font-inter text-base leading-6 font-medium tracking-normal">
                    {request.productName}
                  </Table.Cell>
                  <Table.Cell class="text-gray-500">{formatDate(request.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge variant={availabilityVariant(request.availableUsage)}>
                      {request.availableUsage}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <RequestActions
                      requestId={request.id}
                      userName={request.userName}
                      productName={request.productName}
                      availableUsage={request.availableUsage}
                      approveFormData={data.approveForms[i]}
                      rejectFormData={data.rejectForms[i]}
                    />
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </div>
  </div>
</div>
