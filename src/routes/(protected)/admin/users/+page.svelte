<script lang="ts">
  import { KeyRound } from "@lucide/svelte";
  import { cn } from "tailwind-variants";

  import CancelInvite from "$lib/components/app/cancel-invite.svelte";
  import DeleteUser from "$lib/components/app/delete-user.svelte";
  import EditUser from "$lib/components/app/edit-user.svelte";
  import InviteUser from "$lib/components/app/invite-user.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import ResendInvite from "$lib/components/app/resend-invite.svelte";
  import StatusBadge from "$lib/components/app/status-badge.svelte";
  import UserInitialsAvatar from "$lib/components/app/user-initials-avatar.svelte";
  import UserStatusBadge from "$lib/components/app/user-status-badge.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";
  import { formatDateTime } from "$lib/user-management";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let editForms = $derived(Object.fromEntries(data.editForms.map((form) => [form.data.userId, form])));
  let deleteForms = $derived(Object.fromEntries(data.deleteForms.map((form) => [form.data.userId, form])));
  let resendForms = $derived(Object.fromEntries(data.resendForms.map((form) => [form.data.inviteId, form])));
  let cancelInviteForms = $derived(
    Object.fromEntries(data.cancelInviteForms.map((form) => [form.data.inviteId, form])),
  );

  type ManagedUser = PageData["users"][number];

  const locale = getLocale();

  function getDisplayName(user: ManagedUser) {
    return user.name ?? m.users_pending_name();
  }
</script>

<svelte:head>
  <title>{m.users_meta_title()}</title>
  <meta name="users" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.users_title()} subtitle={m.users_subtitle()}>
    <InviteUser initialForm={data.inviteForm} />
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-2 py-6">
    <div class="overflow-hidden rounded-lg border bg-white">
      {#snippet userActions(user: ManagedUser)}
        {#if user.status === "pending"}
          <div class="flex flex-wrap items-center gap-0.5">
            <ResendInvite user={{ email: user.email }} form={resendForms[user.id]} />
            <CancelInvite user={{ id: user.id, email: user.email }} form={cancelInviteForms[user.id]} />
          </div>
        {:else}
          <div class="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" title={m.users_action_viewLicenses()}>
              <KeyRound class="h-4 w-4 text-gray-500" />
            </Button>
            <EditUser
              user={{ id: user.id, email: user.email, managedRole: user.managedRole }}
              form={editForms[user.id]}
            />
            <DeleteUser
              user={{ id: user.id, name: user.name ?? user.email }}
              form={deleteForms[user.id]}
              isCurrentUser={user.id === data.user.id}
            />
          </div>
        {/if}
      {/snippet}

      <!-- Mobile card list -->
      <ul class="divide-y sm:hidden">
        {#each data.users as user (user.email)}
          <li class={`flex flex-col gap-3 p-4 ${user.status === "pending" ? "bg-amber-50/40" : ""}`}>
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UserInitialsAvatar name={user.name ?? user.email} />
                <div class="min-w-0">
                  <p class="truncate font-semibold text-gray-900">{getDisplayName(user)}</p>
                  <p class="truncate text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-2">
                <UserStatusBadge status={user.status} />
                <StatusBadge variant={user.managedRole === "admin" ? "primary" : "secondary"}>
                  {user.managedRole === "admin" ? m.role_admin() : m.role_employee()}
                </StatusBadge>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <p class="text-xs text-gray-400">{m.users_table_status()}</p>
                <div class="pt-1">
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.users_table_licenses_held()}</p>
                <p class="text-gray-700">0</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{m.users_table_last_active()}</p>
                <p class="text-gray-500">{formatDateTime(user.lastActive, locale)}</p>
              </div>
            </div>
            <div class="">{@render userActions(user)}</div>
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
              <Table.Head>{m.users_table_status()}</Table.Head>
              <Table.Head>{m.users_table_licenses_held()}</Table.Head>
              <Table.Head>{m.users_table_last_active()}</Table.Head>
              <Table.Head class="pr-6">{m.users_table_actions()}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.users as user (user.email)}
              <Table.Row class={user.status === "pending" ? "bg-amber-50/40" : undefined}>
                <Table.Cell class="py-3 pl-6">
                  <div class="flex items-center gap-3">
                    <UserInitialsAvatar name={user.name ?? user.email} />
                    <span class={cn(user.status === "pending" ? "italic" : "font-semibold", "text-gray-900")}>
                      {getDisplayName(user)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell class="text-gray-500">{user.email}</Table.Cell>
                <Table.Cell>
                  <StatusBadge variant={user.managedRole === "admin" ? "primary" : "secondary"}>
                    {user.managedRole === "admin" ? m.role_admin() : m.role_employee()}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  <UserStatusBadge status={user.status} />
                </Table.Cell>
                <Table.Cell class="text-gray-700">0</Table.Cell>
                <Table.Cell class="text-gray-500">{formatDateTime(user.lastActive, locale)}</Table.Cell>
                <Table.Cell class="pr-6 text-left">
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
