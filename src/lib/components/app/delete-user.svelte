<script lang="ts">
  import { UserX } from "@lucide/svelte";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { Infer } from "zod";

  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";
  import { removeUserSchema } from "$lib/schemas/users";
  import { splitName } from "$lib/user-management";

  type ManagedUser = {
    id: string;
    name: string;
  };

  type Props = {
    user: ManagedUser;
    form: SuperValidated<Infer<typeof removeUserSchema>>;
    isCurrentUser?: boolean;
  };

  let { user, form, isCurrentUser = false }: Props = $props();
  let open = $state(false);

  const nameParts = $derived(splitName(user.name));

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(removeUserSchema),
    onUpdated({ form }) {
      if (form.valid) {
        open = false;
        sf.reset({
          id: `remove-user-${user.id}`,
          data: { userId: user.id },
          newState: { userId: user.id },
        });
      }
    },
  });

  const { form: formData, enhance, submitting, message } = sf;
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
    <form method="post" action="?/removeUser" use:enhance class="grid gap-6">
      <input type="hidden" name="userId" bind:value={$formData.userId} />

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

        {#if $message}
          <p class="text-destructive text-sm">{$message}</p>
        {/if}
      </div>
      <div class="flex gap-3">
        <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Button type="submit" variant="destructive" disabled={$submitting} class="flex-1">
          {m.users_delete_submit()}
        </Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
