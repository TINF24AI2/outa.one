<script lang="ts">
  import { Eye, EyeOff } from "@lucide/svelte";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { FormControl, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import { DEMO_PASSWORD, DEMO_USERS } from "$lib/demo-users";
  import { m } from "$lib/paraglide/messages.js";
  import { loginSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const sf = superForm(data.form, {
    validators: zodClient(loginSchema),
  });
  const { form, enhance, submitting, message } = sf;

  let showPassword = $state(false);

  const demoUsers = DEMO_USERS.map((u) => ({
    role: u.role === "admin" ? m.role_admin() : m.role_employee(),
    email: u.email,
  }));
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  <Card class="w-full max-w-sm">
    <CardHeader class="items-center justify-items-center text-center">
      <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
        <img src={logo} alt={m.auth_login_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
      </div>
      <CardTitle class="text-xl">{m.auth_login_title()}</CardTitle>
      <CardDescription>{m.auth_login_description()}</CardDescription>
    </CardHeader>

    <CardContent>
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
              <FormLabel>{m.auth_login_password_label()}</FormLabel>
              <div class="relative">
                <Input
                  {...props}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autocomplete="current-password"
                  bind:value={$form.password}
                  class="pr-10"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                  aria-label={showPassword ? m.auth_login_hide_password() : m.auth_login_show_password()}
                >
                  {#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
                </button>
              </div>
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
        <Button variant="link" class="primary h-auto p-0 text-sm" href="/forgot-password">
          {m.auth_login_forgot_password()}
        </Button>
      </div>
    </CardContent>

    {#if data.hasDemoUsers}
      <CardFooter class="flex-col gap-3">
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
      </CardFooter>
    {/if}
  </Card>
</div>
