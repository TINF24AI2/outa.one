<script lang="ts">
  import { SquarePen } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  import UserRoleSelect from "$lib/components/app/user-role-select.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";
  import type { ManagedRole } from "$lib/user-management";

  type ManagedUser = {
    id: string;
    email: string;
    managedRole: ManagedRole;
  };

  let { user }: { user: ManagedUser } = $props();

  let open = $state(false);
  let loading = $state(false);
  let value = $state<ManagedRole>("user");
  let message = $state<string | null>(null);
  let fieldErrors = $state<{ role?: string }>({});

  $effect(() => {
    if (!open) {
      loading = false;
      value = user.managedRole;
      return;
    }

    message = null;
    fieldErrors = {};
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    type="button"
    class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
    title={m.users_action_edit()}
  >
    <SquarePen class="h-4 w-4 text-gray-500" />
  </Dialog.Trigger>
  <Dialog.Content class="shadow-xl ring-0 sm:max-w-106.25">
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

          const data = (result.type === "success" || result.type === "failure" ? result.data : null) as {
            message?: string;
            fieldErrors?: { role?: string };
          } | null;

          if (result.type === "success") {
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
      <div class="-mx-6 -mt-2"><Separator /></div>
      <div class="grid gap-4">
        <UserRoleSelect
          id={`role-${user.id}`}
          bind:value
          label={m.users_role_label()}
          error={fieldErrors.role}
          hint={m.users_role_admin_hint()}
        />

        {#if message}
          <p class="text-destructive text-sm">{message}</p>
        {/if}
      </div>
      <div class="flex gap-3">
        <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Button type="submit" disabled={loading} class="flex-1">{m.users_edit_submit()}</Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
