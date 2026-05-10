<script lang="ts">
  import { CircleCheckBig, Eye, EyeOff } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { FormControl, FormDescription, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/paraglide/messages.js";
  import { resetPasswordSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const sf = superForm(data.form, {
    validators: zodClient(resetPasswordSchema),
    onUpdated({ form }) {
      if (form.message && typeof form.message === "object" && "success" in form.message) {
        setTimeout(() => goto(resolve("/login")), 3000);
      }
    },
  });
  const { form, enhance, submitting, message } = sf;

  let showPassword = $state(false);
  let showConfirm = $state(false);
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  {#if $message && typeof $message === "object" && "success" in $message}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CircleCheckBig class="h-7 w-7 text-green-600" />
        </div>
        <CardTitle class="text-xl">{m.auth_reset_success_title()}</CardTitle>
        <CardDescription>
          {m.auth_reset_success_description()}
        </CardDescription>
      </CardHeader>
      <CardContent class="text-muted-foreground text-center text-sm">
        {m.auth_reset_redirecting()}
      </CardContent>
    </Card>
  {:else}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <img src={logo} alt={m.auth_reset_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
        </div>
        <CardTitle class="text-xl">{m.auth_reset_title()}</CardTitle>
        <CardDescription>{m.auth_reset_description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form method="post" use:enhance class="flex flex-col gap-4">
          <input type="hidden" name="token" bind:value={$form.token} />

          <FormField form={sf} name="password">
            {#snippet children({ errors })}
              <FormControl>
                {#snippet children({ props })}
                  <FormLabel>{m.auth_reset_password_label()}</FormLabel>
                  <div class="relative">
                    <Input
                      {...props}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autocomplete="new-password"
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
              {#if !errors.length}
                <FormDescription>{m.auth_password_min_length()}</FormDescription>
              {/if}
              <FormFieldErrors />
            {/snippet}
          </FormField>

          <FormField form={sf} name="confirmPassword">
            <FormControl>
              {#snippet children({ props })}
                <FormLabel>{m.auth_reset_confirm_label()}</FormLabel>
                <div class="relative">
                  <Input
                    {...props}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autocomplete="new-password"
                    bind:value={$form.confirmPassword}
                    class="pr-10"
                  />
                  <button
                    type="button"
                    onclick={() => (showConfirm = !showConfirm)}
                    class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                    aria-label={showConfirm ? m.auth_login_hide_password() : m.auth_login_show_password()}
                  >
                    {#if showConfirm}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
                  </button>
                </div>
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
      </CardContent>
    </Card>
  {/if}
</div>
