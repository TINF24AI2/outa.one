<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import AuthPanel from "$lib/components/auth/auth-panel.svelte";
  import AuthShell from "$lib/components/auth/auth-shell.svelte";
  import PasswordInput from "$lib/components/auth/password-input.svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { FormControl, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import { DEMO_PASSWORD, DEMO_USERS } from "$lib/demo-users";
  import { m } from "$lib/paraglide/messages.js";
  import { loginSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(loginSchema),
  });
  const { form, enhance, submitting, message } = sf;

  const demoUsers = DEMO_USERS.map((u) => ({
    role: u.role === "admin" ? m.role_admin() : m.role_employee(),
    email: u.email,
  }));
</script>

<AuthShell>
  <AuthPanel title={m.auth_login_title()}>
    {#snippet icon()}
      <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
        <img src={logo} alt={m.auth_login_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
      </div>
    {/snippet}

    {#snippet description()}
      {m.auth_login_description()}
    {/snippet}

    {#snippet footer()}
      {#if data.hasDemoUsers}
        <Separator />
        <p class="text-muted-foreground text-xs font-medium tracking-wide">
          {m.auth_login_demo_title()}
        </p>
        <div class="w-full space-y-1">
          {#each demoUsers as { role, email: demoEmail } (demoEmail)}
            <button
              type="button"
              onclick={() => {
                $form.email = demoEmail;

                $form.password = DEMO_PASSWORD;
              }}
              class="hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              <span class="text-muted-foreground">{role}</span>
              <span class="font-mono text-xs">{demoEmail}</span>
            </button>
          {/each}
        </div>
        <p class="text-muted-foreground text-xs font-medium tracking-wide">
          {m.auth_login_demo_password_label()}
          <span class="font-mono">{DEMO_PASSWORD}</span>
        </p>
      {/if}
    {/snippet}

    <form method="post" use:enhance class="flex flex-col gap-4">
      <FormField form={sf} name="email">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>{m.auth_login_email_label()}</FormLabel>
            <Input
              {...props}
              type="email"
              placeholder={m.auth_login_email_placeholder()}
              autocomplete="email"
              bind:value={$form.email}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      <FormField form={sf} name="password">
        <FormControl>
          {#snippet children({ props })}
            <PasswordInput
              label={m.auth_login_password_label()}
              bind:value={$form.password}
              {props}
              autocomplete="current-password"
              showLabel={m.auth_login_show_password()}
              hideLabel={m.auth_login_hide_password()}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      {#if $message}
        <Alert variant="destructive">
          <AlertDescription>{$message}</AlertDescription>
        </Alert>
      {/if}

      <Button type="submit" class="w-full" disabled={$submitting}>
        {$submitting ? m.auth_login_submit_loading() : m.auth_login_submit()}
      </Button>
    </form>

    <div class="mt-4 text-center">
      <Button variant="link" class="h-auto p-0 text-sm" href="/forgot-password">
        {m.auth_login_forgot_password()}
      </Button>
    </div>
  </AuthPanel>
</AuthShell>
