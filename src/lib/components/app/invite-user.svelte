<script lang="ts">
  import { Mail, UserPlus } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages";

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const roles = [
    { value: "admin", label: m.role_admin() },
    { value: "user", label: m.role_employee() },
  ];

  let open = $state(false);
  let loading = $state(false);
  let email = $state("");
  let value = $state<"admin" | "user">("user");
  let message = $state<string | null>(null);
  let inviteUrl = $state<string | null>(null);
  let fieldErrors = $state<{ email?: string; role?: string }>({});

  const triggerContent = $derived(roles.find((role) => role.value === value)?.label ?? m.users_role_placeholder());

  function validate() {
    const errors: typeof fieldErrors = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = m.dashboard_invite_error_email_invalid();
    }

    if (!roles.some((role) => role.value === value)) {
      errors.role = "Select a valid role.";
    }

    return errors;
  }

  $effect(() => {
    if (!open) {
      email = "";
      value = "user";
      message = null;
      inviteUrl = null;
      fieldErrors = {};
      loading = false;
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "default" })}>
    <UserPlus />
    {m.users_invite_button()}
  </Dialog.Trigger>
  <Dialog.Content class="shadow-xl ring-0 sm:max-w-106.25">
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
        message = null;
        inviteUrl = null;

        return async ({ result, update }) => {
          loading = false;
          await update({ reset: false });

          const data = (result.type === "success" || result.type === "failure" ? result.data : null) as {
            inviteUrl?: string;
            message?: string;
            fieldErrors?: { email?: string; role?: string };
          } | null;

          message = data?.message ?? null;
          fieldErrors = data?.fieldErrors ?? {};
          inviteUrl = result.type === "success" ? (data?.inviteUrl ?? null) : null;
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
        <div class="grid gap-3">
          <Label for="role">{m.users_role_label()}</Label>
          <Select.Root type="single" name="role" bind:value>
            <Select.Trigger class="w-full">
              {triggerContent}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>{m.users_roles_group_label()}</Select.Label>
                {#each roles as role (role.value)}
                  <Select.Item value={role.value} label={role.label}>
                    {role.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          {#if fieldErrors.role}
            <p class="text-destructive text-xs">{fieldErrors.role}</p>
          {:else}
            <Dialog.Description class="text-xs">{m.users_role_admin_hint()}</Dialog.Description>
          {/if}
        </div>

        {#if message}
          <p class:text-destructive={!inviteUrl} class="text-sm">{message}</p>
        {/if}

        {#if inviteUrl}
          <div class="rounded-lg border bg-white p-3 text-sm">
            <p class="mb-1 text-xs text-gray-500">
              {m.dashboard_invite_link_label({ email: email.trim().toLowerCase() })}
            </p>
            <p class="font-mono text-xs break-all text-gray-700">{inviteUrl}</p>
          </div>
        {/if}
      </div>
      <div class="flex gap-3">
        <Dialog.Close type="button" class={`${buttonVariants({ variant: "secondary" })} flex-1`}>
          {m.users_dialog_cancel()}
        </Dialog.Close>
        <Button type="submit" disabled={loading} class="flex-1">
          <Mail />
          {m.users_invite_submit()}
        </Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
