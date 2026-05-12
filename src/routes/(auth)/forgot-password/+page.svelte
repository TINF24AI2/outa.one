<script lang="ts">
  import { CircleCheckBig, Mail, MoveLeft } from "@lucide/svelte";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import AuthPanel from "$lib/components/auth/auth-panel.svelte";
  import AuthShell from "$lib/components/auth/auth-shell.svelte";
  import { Button } from "$lib/components/ui/button";
  import { FormControl, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/paraglide/messages.js";
  import { forgotPasswordSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(forgotPasswordSchema),
  });
  const { form, enhance, submitting, message } = sf;
</script>

<AuthShell>
  {#if $message}
    <AuthPanel title={m.auth_forgot_success_title()} contentClass="flex flex-col gap-4">
      {#snippet icon()}
        <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CircleCheckBig class="h-7 w-7 text-green-600" />
        </div>
      {/snippet}

      {#snippet description()}
        <span>
          {m.auth_forgot_success_description()}
          <br />
          <span class="text-foreground font-semibold">{$form.email}</span>
        </span>
      {/snippet}

      <p class="text-muted-foreground items-center px-4 py-3 text-sm">
        {m.auth_forgot_success_notice()}
      </p>
      <Button href="/login" class="w-full">
        <MoveLeft class="mr-2 h-4 w-4" />
        {m.auth_forgot_back_to_login()}
      </Button>
      <Button
        variant="link"
        class="h-auto p-0 text-sm"
        onclick={() => {
          window.location.reload();
        }}
      >
        {m.auth_forgot_use_different_email()}
      </Button>
    </AuthPanel>
  {:else}
    <AuthPanel title={m.auth_forgot_title()}>
      {#snippet icon()}
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <img src={logo} alt={m.auth_forgot_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
        </div>
      {/snippet}

      {#snippet description()}
        {m.auth_forgot_description()}
      {/snippet}

      <form method="post" use:enhance class="flex flex-col gap-4">
        <FormField form={sf} name="email">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>{m.auth_forgot_email_label()}</FormLabel>
              <div class="relative">
                <Mail class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  {...props}
                  type="email"
                  placeholder={m.auth_forgot_email_placeholder()}
                  autocomplete="email"
                  bind:value={$form.email}
                  class="pl-9"
                />
              </div>
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <Button type="submit" class="w-full" disabled={$submitting}>
          {$submitting ? m.auth_forgot_submit_loading() : m.auth_forgot_submit()}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <Button variant="link" href="/login" class="text-muted-foreground h-auto p-0 text-sm">
          <MoveLeft class="mr-1.5 h-3.5 w-3.5" />
          {m.auth_forgot_back_to_login()}
        </Button>
      </div>
    </AuthPanel>
  {/if}
</AuthShell>
