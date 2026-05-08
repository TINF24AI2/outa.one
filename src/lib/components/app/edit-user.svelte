<script lang="ts">
import { enhance } from '$app/forms';
import { SquarePen } from '@lucide/svelte';
import { Button, buttonVariants } from '$lib/components/ui/button';
import * as Dialog from '$lib/components/ui/dialog';
import * as Select from '$lib/components/ui/select';
import { Label } from '$lib/components/ui/label';
import { m } from '$lib/paraglide/messages';

type ManagedUser = {
  id: string;
  email: string;
  managedRole: 'admin' | 'user';
};

let { user }: { user: ManagedUser } = $props();

const roles = [
  { value: 'admin', label: m.role_admin() },
  { value: 'user', label: m.role_employee() },
];

let open = $state(false);
let loading = $state(false);
let value = $state<'admin' | 'user'>('user');
let message = $state<string | null>(null);
let fieldErrors = $state<{ role?: string }>({});

const triggerContent = $derived(roles.find((role) => role.value === value)?.label ?? m.users_role_placeholder());

$effect(() => {
  value = user.managedRole;
});

$effect(() => {
  if (!open) {
    loading = false;
    return;
  }

  message = null;
  fieldErrors = {};
});
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    type="button"
    class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
    title={m.users_action_edit()}
  >
    <SquarePen class="h-4 w-4 text-gray-500" />
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <form
      method="post"
      action="?/updateUser"
      use:enhance={() => {
        loading = true;
        message = null;
        fieldErrors = {};

        return async ({ result, update }) => {
          loading = false;
          await update({ reset: false });

          const data = (result.type === 'success' || result.type === 'failure' ? result.data : null) as
            | { message?: string; fieldErrors?: { role?: string } }
            | null;

          if (result.type === 'success') {
            open = false;
            return;
          }

          message = data?.message ?? null;
          fieldErrors = data?.fieldErrors ?? {};
        };
      }}
      class="grid gap-6"
    >
      <input type="hidden" name="userId" value={user.id} />

      <Dialog.Header>
        <Dialog.Title>{m.users_edit_dialog_title()}</Dialog.Title>
        <Dialog.Description>{m.users_edit_dialog_description({ email: user.email })}</Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`role-${user.id}`}>{m.users_role_label()}</Label>
          <Select.Root type="single" name="role" bind:value>
            <Select.Trigger id={`role-${user.id}`} class="w-full">
              {triggerContent}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>{m.users_roles_group_label()}</Select.Label>
                {#each roles as role (role.value)}
                  <Select.Item value={role.value} label={role.label}>
                    {role.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          {#if fieldErrors.role}
            <p class="text-destructive text-xs">{fieldErrors.role}</p>
          {:else}
            <Dialog.Description class="text-xs">{m.users_role_admin_hint()}</Dialog.Description>
          {/if}
        </div>

        {#if message}
          <p class="text-destructive text-sm">{message}</p>
        {/if}
      </div>
      <Dialog.Footer>
        <Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Button type="submit" disabled={loading}>{m.users_edit_submit()}</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
