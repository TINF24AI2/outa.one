<script lang="ts">
  import { CircleX, Eye, EyeOff, Link2Off, UserPlus } from "@lucide/svelte";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { FormControl, FormDescription, FormField, FormFieldErrors, FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/paraglide/messages.js";
  import { signupSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const sf = superForm(data.form, {
    validators: zodClient(signupSchema),
  });
  const { form, enhance, submitting, message } = sf;

  let showPassword = $state(false);
  let showConfirm = $state(false);

  const isError = $derived("error" in data);
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  {#if isError}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="bg-destructive/10 mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          {#if data.error === "no_invite"}
            <Link2Off class="text-destructive h-7 w-7" />
          {:else}
            <CircleX class="text-destructive h-7 w-7" />
          {/if}
        </div>
        <CardTitle class="text-xl">
          {data.error === "no_invite" ? m.auth_signup_invite_required_title() : m.auth_signup_invite_expired_title()}
        </CardTitle>
        <CardDescription>
          {#if data.error === "no_invite"}
            {m.auth_signup_invite_required_description()}
          {:else}
            {m.auth_signup_invite_expired_description()}
          {/if}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex justify-center">
        <Button href="/login" variant="outline" class="w-full">
          {m.auth_signup_back_to_login()}
        </Button>
      </CardContent>
    </Card>
  {:else}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <UserPlus class="h-7 w-7 text-white" />
        </div>
        <CardTitle class="text-xl">{m.auth_signup_title()}</CardTitle>
        <CardDescription>
          {m.auth_signup_description()}
          <br />
          <span class="text-foreground font-medium">{data.email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
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
                  <FormLabel>{m.auth_signup_password_label()}</FormLabel>
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
                <FormLabel>{m.auth_signup_confirm_label()}</FormLabel>
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

          {#if $message}
            <Alert variant="destructive">
              <AlertDescription>{$message}</AlertDescription>
            </Alert>
          {/if}

          <Button type="submit" class="w-full" disabled={$submitting}>
            {$submitting ? m.auth_signup_submit_loading() : m.auth_signup_submit()}
          </Button>
        </form>
      </CardContent>
    </Card>
  {/if}
</div>
