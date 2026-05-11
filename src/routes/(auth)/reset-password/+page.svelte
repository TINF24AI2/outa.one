<script lang="ts">
  import { CircleCheckBig } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import AuthPanel from "$lib/components/auth/auth-panel.svelte";
  import AuthShell from "$lib/components/auth/auth-shell.svelte";
  import PasswordInput from "$lib/components/auth/password-input.svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { FormControl, FormDescription, FormField, FormFieldErrors } from "$lib/components/ui/form";
  import { m } from "$lib/paraglide/messages.js";
  import { resetPasswordSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(resetPasswordSchema),
    onUpdated({ form }) {
      if (form.message && typeof form.message === "object" && "success" in form.message) {
        setTimeout(() => goto(resolve("/login")), 3000);
      }
    },
  });
  const { form, enhance, submitting, message } = sf;
</script>

<AuthShell>
  {#if $message && typeof $message === "object" && "success" in $message}
    <AuthPanel title={m.auth_reset_success_title()} contentClass="text-muted-foreground text-center text-sm">
      {#snippet icon()}
        <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CircleCheckBig class="h-7 w-7 text-green-600" />
        </div>
      {/snippet}

      {#snippet description()}
        {m.auth_reset_success_description()}
      {/snippet}

      {m.auth_reset_redirecting()}
    </AuthPanel>
  {:else}
    <AuthPanel title={m.auth_reset_title()}>
      {#snippet icon()}
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <img src={logo} alt={m.auth_reset_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
        </div>
      {/snippet}

      {#snippet description()}
        {m.auth_reset_description()}
      {/snippet}

      <form method="post" use:enhance class="flex flex-col gap-4">
        <input type="hidden" name="token" bind:value={$form.token} />

        <FormField form={sf} name="password">
          {#snippet children({ errors })}
            <FormControl>
              {#snippet children({ props })}
                <PasswordInput
                  label={m.auth_reset_password_label()}
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
                label={m.auth_reset_confirm_label()}
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

        {#if $message && typeof $message === "string"}
          <Alert variant="destructive">
            <AlertDescription>{$message}</AlertDescription>
          </Alert>
        {/if}

        <Button type="submit" class="w-full" disabled={$submitting}>
          {$submitting ? m.auth_reset_submit_loading() : m.auth_reset_submit()}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <Button variant="link" href="/login" class="text-muted-foreground h-auto p-0 text-sm">
          {m.auth_reset_back_to_login()}
        </Button>
      </div>
    </AuthPanel>
  {/if}
</AuthShell>
