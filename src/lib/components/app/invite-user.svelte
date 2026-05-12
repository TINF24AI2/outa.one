<script lang="ts">
  import { Check, Copy, Mail, UserPlus } from "@lucide/svelte";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import UserRoleSelect from "$lib/components/app/user-role-select.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { m } from "$lib/paraglide/messages";
  import { inviteUserSchema } from "$lib/schemas/users";
  import type { InviteUserInput } from "$lib/schemas/users";

  type InviteActionResult = {
    inviteUrl?: string;
    emailSent?: boolean;
  };

  let { initialForm }: { initialForm: SuperValidated<InviteUserInput> } = $props();

  let open = $state(false);
  let step = $state<"form" | "success">("form");
  let inviteUrl = $state<string | null>(null);
  let emailSent = $state(false);
  let submittedEmail = $state("");
  let copied = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(initialForm, {
    validators: zodClient(inviteUserSchema),
    onUpdated({ form }) {
      if (!form.valid) {
        return;
      }

      const data = form.data as InviteActionResult | null;
      if (!data?.inviteUrl) {
        return;
      }

      inviteUrl = data.inviteUrl;
      emailSent = data.emailSent ?? false;
      submittedEmail = form.data.email.trim().toLowerCase();
      step = "success";
    },
  });
  const { form, errors, enhance, submitting, message } = sf;

  async function copyToClipboard() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  $effect(() => {
    if (!open) {
      step = "form";
      inviteUrl = null;
      emailSent = false;
      submittedEmail = "";
      copied = false;
      sf.reset();
    }
  });
</script>

<AppDialog
  bind:open
  title={step === "form" ? m.users_invite_dialog_title() : m.users_invite_success_title()}
  triggerClass={buttonVariants({ variant: "default" })}
>
  {#snippet description()}
    {#if step === "form"}
      {m.users_invite_dialog_description()}
    {:else if emailSent}
      {m.users_invite_success_email_notice({ email: submittedEmail })}
    {:else}
      {m.users_invite_success_email_failed()}
    {/if}
  {/snippet}

  {#snippet trigger()}
    <UserPlus />
    {m.users_invite_button()}
  {/snippet}

  {#if step === "form"}
    <form method="post" action="?/inviteUser" use:enhance novalidate class="grid gap-6">
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for="email">{m.auth_login_email_label()}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={m.users_invite_email_placeholder()}
            autocomplete="email"
            bind:value={$form.email}
            aria-invalid={$errors.email ? "true" : undefined}
          />
          {#if $errors.email}
            <p class="text-destructive text-xs">{$errors.email[0]}</p>
          {/if}
        </div>
        <UserRoleSelect
          id="role"
          bind:value={$form.role}
          label={m.users_role_label()}
          error={$errors.role?.[0]}
          hint={m.users_role_admin_hint()}
        />

        {#if $message}
          <p class="text-destructive text-sm">{$message}</p>
        {/if}
      </div>
      <div class="flex gap-3">
        <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
          {m.users_dialog_cancel()}
        </Button>
        <Button type="submit" disabled={$submitting} class="flex-1">
          <Mail />
          {$submitting ? m.users_invite_submit_loading() : m.users_invite_submit()}
        </Button>
      </div>
    </form>
  {:else}
    <div class="grid gap-2">
      <p class="text-sm font-medium">{m.users_invite_success_backup_label()}</p>
      <p class="text-muted-foreground text-xs">{m.users_invite_success_backup_hint()}</p>
      <div class="bg-muted flex min-w-0 items-center gap-2 rounded-lg border p-3">
        <p class="min-w-0 flex-1 truncate font-mono text-xs">{inviteUrl}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="size-7 shrink-0"
          onclick={copyToClipboard}
          aria-label={m.users_invite_copy_link()}
        >
          {#if copied}
            <Check class="size-3.5 text-green-600" />
          {:else}
            <Copy class="size-3.5" />
          {/if}
        </Button>
      </div>
      {#if copied}
        <p class="text-xs text-green-600">{m.users_invite_copied()}</p>
      {/if}
    </div>
    <Button type="button" onclick={() => (open = false)}>
      {m.users_invite_done()}
    </Button>
  {/if}
</AppDialog>
