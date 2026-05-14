<script lang="ts">
  import { SquarePen } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import UserRoleSelect from "$lib/components/app/user-role-select.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form/index";
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
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        open = false;
        sf.reset({
          id: `update-user-${user.id}`,
          data: { userId: user.id, role: user.managedRole },
          newState: { userId: user.id, role: user.managedRole },
        });
        toast.success(m.users_edit_success({ name: user.email }));
      }
    },
  });

  const { form: formData, errors, enhance, submitting } = sf;
</script>

<AppDialog
  bind:open
  title={m.users_edit_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.users_action_edit()}
>
  {#snippet description()}
    {m.users_edit_dialog_description({ email: user.email })}
  {/snippet}

  {#snippet trigger()}
    <SquarePen class="h-4 w-4 text-gray-500" />
  {/snippet}

  <form method="post" action="?/updateUser" use:enhance class="grid gap-6">
    <input type="hidden" name="userId" bind:value={$formData.userId} />
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

          <Form.FieldErrors />
        </Form.Control>
      </Form.Field>
    </div>
    <div class="flex gap-3">
      <button type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`} onclick={() => (open = false)}>
        {m.users_dialog_cancel()}
      </button>
      <Form.Button disabled={$submitting} class="w-full flex-1">{m.users_edit_submit()}</Form.Button>
    </div>
  </form>
</AppDialog>
