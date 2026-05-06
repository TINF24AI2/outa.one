<script lang="ts">
import { KeyRound, SquarePen, UserPlus, UserX } from '@lucide/svelte';
import PageHeader from '$lib/components/app/page-header.svelte';
import { Button } from '$lib/components/ui/button';
import * as Table from '$lib/components/ui/table';
import { m } from '$lib/paraglide/messages';

let { data } = $props();

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}
</script>

<div class="flex flex-col w-full h-full overflow-hidden">
  <PageHeader title={m.users_title()} subtitle={m.users_subtitle()}>
    <Button href="/users/new">
      <UserPlus class="w-4 h-4" />
      {m.users_invite_button()}
    </Button>
  </PageHeader>

  <div class="flex-1 overflow-auto w-full max-w-7xl mx-auto p-6">
    <div class="rounded-lg border bg-white">
      <Table.Root>
        <Table.Header class="bg-gray-100">
          <Table.Row class="[&>th]:text-neutral-500">
            <Table.Head class="pl-6">{m.users_table_name()}</Table.Head>
            <Table.Head>{m.users_table_email()}</Table.Head>
            <Table.Head>{m.users_table_role()}</Table.Head>
            <Table.Head>{m.users_table_licenses_held()}</Table.Head>
            <Table.Head>{m.users_table_last_active()}</Table.Head>
            <Table.Head class="pr-6 text-right">{m.users_table_actions()}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each data.users as u}
            <Table.Row>
              <Table.Cell class="pl-6 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
                  >
                    {getInitials(u.name)}
                  </div>
                  <span class="font-semibold text-gray-900">{u.name}</span>
                </div>
              </Table.Cell>
              <Table.Cell class="text-gray-500">{u.email}</Table.Cell>
              <Table.Cell>
                <span
                  class={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium border ${
                    u.role === 'admin'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {u.role === 'admin' ? m.role_admin() : m.role_employee()}
                </span>
              </Table.Cell>
              <Table.Cell class="text-gray-700">0</Table.Cell>
              <Table.Cell class="text-gray-500">{formatDate(u.lastActive)}</Table.Cell>
              <Table.Cell class="pr-6">
                <div class="flex items-center justify-end gap-0.5">
                  <Button variant="ghost" size="icon-sm" title={m.users_action_reset_password()}>
                    <KeyRound class="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title={m.users_action_edit()}>
                    <SquarePen class="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title={m.users_action_remove()}>
                    <UserX class="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</div>
