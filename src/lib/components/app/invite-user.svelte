<script lang="ts">
  import { Check, Copy, Mail, UserPlus } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  import UserRoleSelect from "$lib/components/app/user-role-select.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";
  import { inviteUserSchema } from "$lib/schemas/users";
  import type { InviteUserInput } from "$lib/schemas/users";
  import type { ManagedRole } from "$lib/user-management";

  type InviteFieldErrors = Partial<Record<keyof InviteUserInput, string>>;

  let open = $state(false);
  let loading = $state(false);
  let email = $state("");
  let value = $state<ManagedRole>("user");
  let fieldErrors = $state<InviteFieldErrors>({});
  let step = $state<"form" | "success">("form");
  let inviteUrl = $state<string | null>(null);
  let emailSent = $state(false);
  let submittedEmail = $state("");
  let copied = $state(false);

  function validate() {
    const result = inviteUserSchema.safeParse({ email, role: value });

    if (result.success) {
      return {};
    }

    const { fieldErrors } = result.error.flatten();

    return {
      email: fieldErrors.email?.[0],
      role: fieldErrors.role?.[0],
    } satisfies InviteFieldErrors;
  }

  async function copyToClipboard() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  $effect(() => {
    if (!open) {
      email = "";
      value = "user";
      fieldErrors = {};
      loading = false;
      step = "form";
      inviteUrl = null;
      emailSent = false;
      submittedEmail = "";
      copied = false;
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "default" })}>
    <UserPlus />
    {m.users_invite_button()}
  </Dialog.Trigger>

  <Dialog.Content class="shadow-xl ring-0 sm:max-w-106.25">
    {#if step === "form"}
      <form
        method="post"
        action="?/inviteUser"
        novalidate
        use:enhance={({ cancel }) => {
          const errors = validate();

          if (Object.keys(errors).length > 0) {
            fieldErrors = errors;
            cancel();
            return;
          }

          loading = true;
          fieldErrors = {};

          return async ({ result, update }) => {
            loading = false;
            await update({ reset: false });

            const data = (result.type === "success" || result.type === "failure" ? result.data : null) as {
              inviteUrl?: string;
              emailSent?: boolean;
              message?: string;
              fieldErrors?: { email?: string; role?: string };
            } | null;

            if (result.type === "success" && data?.inviteUrl) {
              inviteUrl = data.inviteUrl;
              emailSent = data?.emailSent ?? false;
              submittedEmail = email.trim().toLowerCase();
              step = "success";
            } else {
              fieldErrors = data?.fieldErrors ?? {};
            }
          };
        }}
        class="grid gap-6"
      >
        <Dialog.Header>
          <Dialog.Title>{m.users_invite_dialog_title()}</Dialog.Title>
          <Dialog.Description>{m.users_invite_dialog_description()}</Dialog.Description>
        </Dialog.Header>
        <div class="-mx-6 -mt-2"><Separator /></div>
        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="email">{m.auth_login_email_label()}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={m.users_invite_email_placeholder()}
              autocomplete="email"
              bind:value={email}
              aria-invalid={!!fieldErrors.email}
            />
            {#if fieldErrors.email}
              <p class="text-destructive text-xs">{fieldErrors.email}</p>
            {/if}
          </div>
          <UserRoleSelect
            id="role"
            bind:value
            label={m.users_role_label()}
            error={fieldErrors.role}
            hint={m.users_role_admin_hint()}
          />
        </div>
        <div class="flex gap-3">
          <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
            {m.users_dialog_cancel()}
          </Dialog.Close>
          <Button type="submit" disabled={loading} class="flex-1">
            <Mail />
            {loading ? m.users_invite_submit_loading() : m.users_invite_submit()}
          </Button>
        </div>
      </form>
    {:else}
      <div class="grid gap-6">
        <Dialog.Header>
          <Dialog.Title>{m.users_invite_success_title()}</Dialog.Title>
          <Dialog.Description>
            {#if emailSent}
              {m.users_invite_success_email_notice({ email: submittedEmail })}
            {:else}
              {m.users_invite_success_email_failed()}
            {/if}
          </Dialog.Description>
        </Dialog.Header>
        <div class="-mx-6 -mt-2"><Separator /></div>
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
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
