<script lang="ts">
  import { Send } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import { Button } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages";
  import { resendInviteSchema } from "$lib/schemas/users";

  type PendingUser = {
    email: string;
  };

  type ResendInviteActionResult = {
    emailSent?: boolean;
  };

  let { user, form }: { user: PendingUser; form: SuperValidated<Infer<typeof resendInviteSchema>> } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(resendInviteSchema),
    onUpdate({ result }) {
      if (result.type !== "success") {
        return;
      }

      const data = result.data as ResendInviteActionResult | null;

      toast.success(
        data?.emailSent === false
          ? m.users_resend_invite_success_email_failed({ email: user.email })
          : m.users_resend_invite_success({ email: user.email }),
      );
    },
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      }
    },
  });

  const { form: formData, enhance, submitting } = sf;
</script>

<form method="post" action="?/resendInvite" use:enhance>
  <input type="hidden" name="inviteId" bind:value={$formData.inviteId} />
  <Button
    type="submit"
    variant="ghost"
    size="icon-sm"
    disabled={$submitting}
    title={m.users_action_resend_invite()}
    aria-label={m.users_action_resend_invite()}
  >
    <Send class="h-4 w-4 text-gray-500" />
  </Button>
</form>
