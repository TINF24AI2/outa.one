<script lang="ts">
  import { CircleCheck, CircleX } from "@lucide/svelte";

  //import { resolve } from "$app/paths";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function getClass(num: number) {
    if (num === 0) {
      return "text-red-500 bg-red-100 w-7 h-6 rounded py-1 px-[10px] flex items-center justify-center";
    } else if (num <= 5) {
      return "text-orange-500 bg-orange-100 w-7 h-6 rounded py-1 px-[10px] flex items-center justify-center";
    } else {
      return "text-green-500 bg-green-100 w-7 h-6 rounded py-1 px-[10px] flex items-center justify-center";
    }
  }

  function isEnabled(num: number): boolean {
    return num === 0;
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
    <div class="group mb-6 flex h-28 w-full flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors">
      <p class="mb-1 text-xs text-gray-500 sm:text-sm">{m.requests_pending_requests()}</p>
      <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.requests.length}</p>
    </div>

    <div class="overflow-hidden rounded-lg border bg-white">
      <div class="mt-6 mb-6 hidden sm:block sm:px-6">
        <p class="text-xl leading-7 font-semibold">{m.requests_pending_requests()}</p>
        <p class="mb-1 text-xs text-gray-500 sm:text-sm">{data.requests.length} {m.requests_pending_requests_sub()}</p>
      </div>

      <ul class="divide-y sm:hidden">
        {#each data.requests as request (request.id)}
          <li class="flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-gray-900">{request.userName}</p>
                <p class="truncate text-sm text-gray-500">{request.email}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <p class="text-xs text-gray-400">{m.requests_user()}</p>
                <p class="text-gray-700">{request.productName}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.requests_date()}</p>
                <p class="text-gray-700">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.requests_available()}</p>
                <div class={getClass(request.availableUsage)}>{request.availableUsage}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                disabled={isEnabled(request.availableUsage)}
                type="button"
                class="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-500 transition disabled:cursor-not-allowed disabled:bg-green-50 disabled:text-green-300"
              >
                <CircleCheck class="h-4 w-4" />
                <span>{m.requests_approve()}</span>
              </button>
              <button
                type="button"
                class="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-500 transition"
              >
                <CircleX class="h-4 w-4" />
                <span>{m.requests_deny()}</span>
              </button>
            </div>
          </li>
        {/each}
      </ul>

      <div class="hidden sm:block">
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
            {#each data.requests as request (request.id)}
              <Table.Row>
                <Table.Cell class="flex flex-col gap-1 py-3 pl-6">
                  <p class="font-inter text-base leading-6 font-medium tracking-normal">{request.userName}</p>
                  <p class="font-inter text-sm leading-5 font-normal tracking-normal text-gray-500">{request.email}</p>
                </Table.Cell>
                <Table.Cell class="font-inter text-base leading-6 font-medium tracking-normal">
                  {request.productName}
                </Table.Cell>
                <Table.Cell class="text-gray-500">{formatDate(request.createdAt)}</Table.Cell>
                <Table.Cell>
                  <div class={getClass(request.availableUsage)}>{request.availableUsage}</div>
                </Table.Cell>
                <Table.Cell class="text-gray-700">
                  <div class="flex items-center gap-2">
                    <button
                      disabled={isEnabled(request.availableUsage)}
                      type="button"
                      class="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-500 transition disabled:cursor-not-allowed disabled:bg-emerald-50 disabled:text-emerald-300"
                    >
                      <CircleCheck class="h-4 w-4" />
                      <span>{m.requests_approve()}</span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-500 transition"
                    >
                      <CircleX class="h-4 w-4" />
                      <span>{m.requests_deny()}</span>
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  </div>
</div>
