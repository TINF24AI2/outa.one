<script lang="ts">
  import { CircleCheck, CircleX } from "@lucide/svelte";

  //import { resolve } from "$app/paths";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";

  type RequestItem = {
    userName: string;
    email: string;
    product: string;
    date: string;
    available: number;
  };

  const requests: RequestItem[] = [
    {
      userName: "name nachnname",
      email: "email@test.de",
      product: "Adobe Creative Cloud",
      date: "Jan 1, 2003, 12:30 PM",
      available: 5,
    },
  ];

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
</script>

<svelte:head>
  <title>{m.requests_meta_title()}</title>
  <meta name="requests" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.requests_page_header()} subtitle={m.requests_page_subheader()}></PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
    <div class="group mb-6 flex h-28 w-full flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors">
      <p class="mb-1 text-xs text-gray-500 sm:text-sm">Pending Requests</p>
      <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">5 pending requests</p>
    </div>

    <div class="overflow-hidden rounded-lg border bg-white">
      <div class="border-b px-4 py-4 sm:px-6">
        <p class="mt-1 text-xl font-bold text-gray-900 sm:text-3xl">5</p>
        <p class="mb-1 text-xs text-gray-500 sm:text-sm">test</p>
      </div>

      <ul class="divide-y sm:hidden">
        {#each requests as request (request.email)}
          <li class="flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-gray-900">{request.userName}</p>
                <p class="truncate text-sm text-gray-500">{request.email}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <p class="text-xs text-gray-400">Produkte</p>
                <p class="text-gray-700">{request.product}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Datum</p>
                <p class="text-gray-700">{request.date}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Verfügbare Lizenzen</p>
                <div class={getClass(request.available)}>{request.available}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                disabled={isEnabled(request.available)}
                type="button"
                class="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-500 transition disabled:cursor-not-allowed disabled:bg-green-50 disabled:text-green-300"
              >
                <CircleCheck class="h-4 w-4" />
                <span>Akzeptieren</span>
              </button>
              <button
                type="button"
                class="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-500 transition"
              >
                <CircleX class="h-4 w-4" />
                <span>Ablehnen</span>
              </button>
            </div>
          </li>
        {/each}
      </ul>

      <div class="hidden sm:block">
        <Table.Root>
          <Table.Header class="bg-slate-50">
            <Table.Row class="[&>th]:text-neutral-500">
              <Table.Head class="pl-6">Nutzer</Table.Head>
              <Table.Head>Produkte</Table.Head>
              <Table.Head>Datum</Table.Head>
              <Table.Head>Verfügbare Lizenzen</Table.Head>
              <Table.Head class="pr-6">Aktionen</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {#each requests as request (request.email)}
              <Table.Row>
                <Table.Cell class="flex flex-col gap-1 py-3 pl-6">
                  <p class="font-inter text-base leading-6 font-medium tracking-normal">{request.userName}</p>
                  <p class="font-inter text-sm leading-5 font-normal tracking-normal text-gray-500">{request.email}</p>
                </Table.Cell>
                <Table.Cell class="font-inter text-base leading-6 font-medium tracking-normal">
                  {request.product}
                </Table.Cell>
                <Table.Cell class="text-gray-500">{request.date}</Table.Cell>
                <Table.Cell>
                  <div class={getClass(request.available)}>{request.available}</div>
                </Table.Cell>
                <Table.Cell class="text-gray-700">
                  <div class="flex items-center gap-2">
                    <button
                      disabled={isEnabled(request.available)}
                      type="button"
                      class="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-500 transition disabled:cursor-not-allowed disabled:bg-green-50 disabled:text-green-300"
                    >
                      <CircleCheck class="h-4 w-4" />
                      <span>Akzeptieren</span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-500 transition"
                    >
                      <CircleX class="h-4 w-4" />
                      <span>Ablehnen</span>
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
