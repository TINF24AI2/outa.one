<script lang="ts">
  import { KeyRound } from "@lucide/svelte";

  import DeleteUser from "$lib/components/app/delete-user.svelte";
  import EditUser from "$lib/components/app/edit-user.svelte";
  import InviteUser from "$lib/components/app/invite-user.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import UserInitialsAvatar from "$lib/components/app/user-initials-avatar.svelte";
  import UserRoleBadge from "$lib/components/app/user-role-badge.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";
  import { formatDateTime } from "$lib/user-management";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  type ManagedUser = PageData["users"][number];

  const locale = getLocale();
</script>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.users_title()} subtitle={m.users_subtitle()}>
    <InviteUser />
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <div class="overflow-hidden rounded-lg border bg-white">
      {#snippet userActions(user: ManagedUser)}
        <div class="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" title={m.users_action_viewLicenses()}>
            <KeyRound class="h-4 w-4 text-gray-500" />
          </Button>
          <EditUser {user} />
          <DeleteUser {user} isCurrentUser={user.id === data.user.id} />
        </div>
      {/snippet}

      <!-- Mobile card list -->
      <ul class="divide-y sm:hidden">
        {#each data.users as user (user.email)}
          <li class="flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UserInitialsAvatar name={user.name} />
                <div class="min-w-0">
                  <p class="truncate font-semibold text-gray-900">{user.name}</p>
                  <p class="truncate text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <UserRoleBadge role={user.managedRole} />
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <p class="text-xs text-gray-400">{m.users_table_licenses_held()}</p>
                <p class="text-gray-700">0</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.users_table_last_active()}</p>
                <p class="text-gray-500">{formatDateTime(user.lastActive, locale)}</p>
              </div>
            </div>
            <div class="flex justify-end">{@render userActions(user)}</div>
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
                    <UserInitialsAvatar name={user.name} />
                    <span class="font-semibold text-gray-900">{user.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell class="text-gray-500">{user.email}</Table.Cell>
                <Table.Cell>
                  <UserRoleBadge role={user.managedRole} />
                </Table.Cell>
                <Table.Cell class="text-gray-700">0</Table.Cell>
                <Table.Cell class="text-gray-500">{formatDateTime(user.lastActive, locale)}</Table.Cell>
                <Table.Cell class="pr-6">
                  {@render userActions(user)}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  </div>
</div>
