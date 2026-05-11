<script lang="ts">
  import { KeyRound } from "@lucide/svelte";

  import DeleteUser from "$lib/components/app/delete-user.svelte";
  import EditUser from "$lib/components/app/edit-user.svelte";
  import InviteUser from "$lib/components/app/invite-user.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";

  let { data } = $props();

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function formatDate(date: Date | string | null): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat(getLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }
</script>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.users_title()} subtitle={m.users_subtitle()}>
    <InviteUser />
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <div class="overflow-hidden rounded-lg border bg-white">
      <!-- Mobile card list -->
      <ul class="divide-y sm:hidden">
        {#each data.users as user (user.email)}
          <li class="flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
                >
                  {getInitials(user.name)}
                </div>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-gray-900">{user.name}</p>
                  <p class="truncate text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <span
                class={`inline-flex shrink-0 items-center rounded border px-2.5 py-0.5 text-xs font-medium ${
                  user.managedRole === "admin"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                {user.managedRole === "admin" ? m.role_admin() : m.role_employee()}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <p class="text-xs text-gray-400">{m.users_table_licenses_held()}</p>
                <p class="text-gray-700">0</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.users_table_last_active()}</p>
                <p class="text-gray-500">{formatDate(user.lastActive)}</p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="icon-sm" title={m.users_action_viewLicenses()}>
                <KeyRound class="h-4 w-4 text-gray-500" />
              </Button>
              <EditUser {user} />
              <DeleteUser {user} isCurrentUser={user.id === data.user.id} />
            </div>
          </li>
        {/each}
      </ul>

      <!-- Desktop table -->
      <div class="hidden sm:block">
        <Table.Root>
          <Table.Header class="bg-slate-50">
            <Table.Row class="[&>th]:text-neutral-500">
              <Table.Head class="pl-6">{m.users_table_name()}</Table.Head>
              <Table.Head>{m.users_table_email()}</Table.Head>
              <Table.Head>{m.users_table_role()}</Table.Head>
              <Table.Head>{m.users_table_licenses_held()}</Table.Head>
              <Table.Head>{m.users_table_last_active()}</Table.Head>
              <Table.Head>{m.users_table_actions()}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.users as user (user.email)}
              <Table.Row>
                <Table.Cell class="py-3 pl-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
                    >
                      {getInitials(user.name)}
                    </div>
                    <span class="font-semibold text-gray-900">{user.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell class="text-gray-500">{user.email}</Table.Cell>
                <Table.Cell>
                  <span
                    class={`inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium ${
                      user.managedRole === "admin"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {user.managedRole === "admin" ? m.role_admin() : m.role_employee()}
                  </span>
                </Table.Cell>
                <Table.Cell class="text-gray-700">0</Table.Cell>
                <Table.Cell class="text-gray-500">{formatDate(user.lastActive)}</Table.Cell>
                <Table.Cell class="pr-6">
                  <div class="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon-sm" title={m.users_action_viewLicenses()}>
                      <KeyRound class="h-4 w-4 text-gray-500" />
                    </Button>
                    <EditUser {user} />
                    <DeleteUser {user} isCurrentUser={user.id === data.user.id} />
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
