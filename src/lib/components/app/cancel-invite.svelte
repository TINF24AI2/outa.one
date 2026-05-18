<script lang="ts">
  import { Ban } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages";
  import { cancelInviteSchema } from "$lib/schemas/users";

  type PendingUser = {
    id: string;
    email: string;
  };

  let { user, form }: { user: PendingUser; form: SuperValidated<Infer<typeof cancelInviteSchema>> } = $props();

  let open = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(cancelInviteSchema),
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        open = false;
        sf.reset({
          id: `cancel-invite-${user.id}`,
          data: { inviteId: user.id },
          newState: { inviteId: user.id },
        });
        toast.success(m.users_cancel_invite_success({ email: user.email }));
      }
    },
  });

  const { form: formData, enhance, submitting } = sf;
</script>

<AppDialog
  bind:open
  title={m.users_cancel_invite_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.users_action_cancel_invite()}
>
  {#snippet description()}
    {m.users_cancel_invite_dialog_description({ email: user.email })}
  {/snippet}

  {#snippet trigger()}
    <Ban class="h-4 w-4 text-red-500" />
  {/snippet}

  <form method="post" action="?/cancelInvite" use:enhance class="grid gap-6">
    <input type="hidden" name="inviteId" bind:value={$formData.inviteId} />
    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.users_dialog_cancel()}
      </Button>
      <Button type="submit" variant="destructive" disabled={$submitting} class="flex-1">
        {m.users_cancel_invite_submit()}
      </Button>
    </div>
  </form>
</AppDialog>
