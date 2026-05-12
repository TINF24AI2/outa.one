<script lang="ts">
  import { SquarePen } from "@lucide/svelte";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import UserRoleSelect from "$lib/components/app/user-role-select.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Form from "$lib/components/ui/form/index";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";
  import { updateUserRoleSchema } from "$lib/schemas/users";
  import type { ManagedRole } from "$lib/user-management";

  type ManagedUser = {
    id: string;
    email: string;
    managedRole: ManagedRole;
  };

  let { user, form }: { user: ManagedUser; form: SuperValidated<Infer<typeof updateUserRoleSchema>> } = $props();

  let open = $state(false);
  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(updateUserRoleSchema),
    onUpdate({ form }) {
      if (form.valid) {
        open = false;
        sf.reset({
          id: `update-user-${user.id}`,
          data: { userId: user.id, role: user.managedRole },
          newState: { userId: user.id, role: user.managedRole },
        });
      }
    },
  });

  const { form: formData, errors, enhance, submitting, message } = sf;
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
    <form method="post" action="?/updateUser" use:enhance class="grid gap-6">
      <input type="hidden" name="userId" bind:value={$formData.userId} />
      <Dialog.Header>
        <Dialog.Title>{m.users_edit_dialog_title()}</Dialog.Title>
        <Dialog.Description>{m.users_edit_dialog_description({ email: user.email })}</Dialog.Description>
      </Dialog.Header>
      <div class="-mx-6 -mt-2"><Separator /></div>
      <div class="grid gap-4">
        <Form.Field form={sf} name="role">
          <Form.Control>
            <UserRoleSelect
              id={`role-${user.id}`}
              bind:value={$formData.role}
              label={m.users_role_label()}
              error={$errors.role?.[0]}
              hint={m.users_role_admin_hint()}
            />

            {#if $message}
              <p class="text-destructive text-sm">{$message}</p>
            {/if}
            <Form.FieldErrors />
          </Form.Control>
        </Form.Field>
      </div>
      <div class="flex gap-3">
        <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Form.Button disabled={$submitting} class="w-full flex-1">{m.users_edit_submit()}</Form.Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
