<script lang="ts">
  import { UserX } from "@lucide/svelte";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { Infer } from "zod";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
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

<AppDialog
  bind:open
  title={m.users_delete_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={isCurrentUser ? "You cannot remove your own account." : m.users_action_remove()}
  triggerDisabled={isCurrentUser}
>
  {#snippet description()}
    {m.users_delete_dialog_description({
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
    })}
  {/snippet}

  {#snippet trigger()}
    <UserX class="h-4 w-4 text-red-500" />
  {/snippet}

  <form method="post" action="?/removeUser" use:enhance class="grid gap-6">
    <input type="hidden" name="userId" bind:value={$formData.userId} />
    <div class="grid gap-4">
      <div class="grid gap-3">
        <h3 class="font-semibold">{m.users_delete_effects_title()}</h3>
        <ul class="list-inside list-disc text-xs text-gray-500">
          <li>{m.users_delete_effect_no_access({ firstName: nameParts.firstName })}</li>
          <li>{m.users_delete_effect_no_licenses({ firstName: nameParts.firstName })}</li>
          <li>{m.users_delete_effect_keys_freed({ firstName: nameParts.firstName })}</li>
          <li>{m.users_delete_effect_remains_in_history({ firstName: nameParts.firstName })}</li>
        </ul>
      </div>

      {#if $message}
        <p class="text-destructive text-sm">{$message}</p>
      {/if}
    </div>
    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.users_dialog_cancel()}
      </Button>
      <Button type="submit" variant="destructive" disabled={$submitting} class="flex-1">
        {m.users_delete_submit()}
      </Button>
    </div>
  </form>
</AppDialog>
