<script lang="ts">
  import { CircleX, Link2Off, UserPlus } from "@lucide/svelte";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import AuthPanel from "$lib/components/auth/auth-panel.svelte";
  import AuthShell from "$lib/components/auth/auth-shell.svelte";
  import PasswordInput from "$lib/components/auth/password-input.svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { FormControl, FormDescription, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/paraglide/messages.js";
  import { signupSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(signupSchema),
  });
  const { form, enhance, submitting, message } = sf;

  const isError = $derived("error" in data);
</script>

<AuthShell>
  {#if isError}
    <AuthPanel
      title={data.error === "no_invite" ? m.auth_signup_invite_required_title() : m.auth_signup_invite_expired_title()}
    >
      {#snippet icon()}
        <div class="bg-destructive/10 mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          {#if data.error === "no_invite"}
            <Link2Off class="text-destructive h-7 w-7" />
          {:else}
            <CircleX class="text-destructive h-7 w-7" />
          {/if}
        </div>
      {/snippet}

      {#snippet description()}
        <span>
          {#if data.error === "no_invite"}
            {m.auth_signup_invite_required_description()}
          {:else}
            {m.auth_signup_invite_expired_description()}
          {/if}
        </span>
      {/snippet}

      <Button href="/login" variant="outline" class="w-full">
        {m.auth_signup_back_to_login()}
      </Button>
    </AuthPanel>
  {:else}
    <AuthPanel title={m.auth_signup_title()}>
      {#snippet icon()}
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <UserPlus class="h-7 w-7 text-white" />
        </div>
      {/snippet}

      {#snippet description()}
        <span>
          {m.auth_signup_description()}
          <br />
          <span class="text-foreground font-medium">{data.email}</span>
        </span>
      {/snippet}

      <form method="post" use:enhance class="flex flex-col gap-4">
        <input type="hidden" name="token" bind:value={$form.token} />

        <FormField form={sf} name="name">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>{m.auth_signup_name_label()}</FormLabel>
              <Input
                {...props}
                type="text"
                placeholder={m.auth_signup_name_placeholder()}
                autocomplete="name"
                bind:value={$form.name}
              />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <FormField form={sf} name="password">
          {#snippet children({ errors })}
            <FormControl>
              {#snippet children({ props })}
                <PasswordInput
                  label={m.auth_signup_password_label()}
                  bind:value={$form.password}
                  {props}
                  autocomplete="new-password"
                  showLabel={m.auth_login_show_password()}
                  hideLabel={m.auth_login_hide_password()}
                />
              {/snippet}
            </FormControl>
            {#if !errors.length}
              <FormDescription>{m.auth_password_min_length()}</FormDescription>
            {/if}
            <FormFieldErrors />
          {/snippet}
        </FormField>

        <FormField form={sf} name="confirmPassword">
          <FormControl>
            {#snippet children({ props })}
              <PasswordInput
                label={m.auth_signup_confirm_label()}
                bind:value={$form.confirmPassword}
                {props}
                autocomplete="new-password"
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
          {$submitting ? m.auth_signup_submit_loading() : m.auth_signup_submit()}
        </Button>
      </form>
    </AuthPanel>
  {/if}
</AuthShell>
