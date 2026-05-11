<script lang="ts">
  import { UserX } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";
  import { splitName } from "$lib/user-management";

  type ManagedUser = {
    id: string;
    name: string;
  };

  let { user, isCurrentUser = false }: { user: ManagedUser; isCurrentUser?: boolean } = $props();

  const nameParts = $derived(splitName(user.name));

  let open = $state(false);
  let loading = $state(false);
  let message = $state<string | null>(null);

  $effect(() => {
    if (open) {
      message = null;
      return;
    }

    loading = false;
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    type="button"
    class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
    title={isCurrentUser ? "You cannot remove your own account." : m.users_action_remove()}
    disabled={isCurrentUser}
  >
    <UserX class="h-4 w-4 text-red-500" />
  </Dialog.Trigger>
  <Dialog.Content class="shadow-xl ring-0 sm:max-w-106.25">
    <form
      method="post"
      action="?/removeUser"
      use:enhance={() => {
        loading = true;
        message = null;

        return async ({ result, update }) => {
          loading = false;
          await update({ reset: false });

          if (result.type === "success") {
            open = false;
            return;
          }

          const data = (result.type === "failure" ? result.data : null) as { message?: string } | null;
          message = data?.message ?? null;
        };
      }}
      class="grid gap-6"
    >
      <input type="hidden" name="userId" value={user.id} />

      <Dialog.Header>
        <Dialog.Title>{m.users_delete_dialog_title()}</Dialog.Title>
        <Dialog.Description>
          {m.users_delete_dialog_description({
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
          })}
        </Dialog.Description>
      </Dialog.Header>
      <div class="-mx-6 -mt-2"><Separator /></div>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <h3>{m.users_delete_effects_title()}</h3>
          <ul class="text-xs text-gray-500">
            <li>- {m.users_delete_effect_no_access({ firstName: nameParts.firstName })}</li>
            <li>- {m.users_delete_effect_no_licenses({ firstName: nameParts.firstName })}</li>
            <li>- {m.users_delete_effect_keys_freed({ firstName: nameParts.firstName })}</li>
            <li>- {m.users_delete_effect_remains_in_history({ firstName: nameParts.firstName })}</li>
          </ul>
        </div>

        {#if message}
          <p class="text-destructive text-sm">{message}</p>
        {/if}
      </div>
      <div class="flex gap-3">
        <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Button type="submit" variant="destructive" disabled={loading} class="flex-1">
          {m.users_delete_submit()}
        </Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
