<script lang="ts">
import { CircleCheckBig, Mail, MoveLeft } from '@lucide/svelte';
import { enhance } from '$app/forms';
import logo from '$lib/assets/logo.svg';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { m } from '$lib/paraglide/messages.js';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();

let loading = $state(false);
let email = $state('');
let fieldError = $state('');

function validate() {
  if (!email.trim()) return m.auth_forgot_error_email_required();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return m.auth_forgot_error_email_invalid();
  return '';
}
</script>

<div
  class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12"
>
  {#if form?.success}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div
          class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100"
        >
          <CircleCheckBig class="h-7 w-7 text-green-600" />
        </div>
        <CardTitle class="text-xl">{m.auth_forgot_success_title()}</CardTitle>
        <CardDescription>
          {m.auth_forgot_success_description()}<br />
          <span class="text-foreground font-semibold">{form.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
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
      </CardContent>
    </Card>
  {:else}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div
          class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <img
            src={logo}
            alt={m.auth_forgot_logo_alt()}
            class="h-8 w-8 object-contain brightness-0 invert"
          />
        </div>
        <CardTitle class="text-xl">{m.auth_forgot_title()}</CardTitle>
        <CardDescription>{m.auth_forgot_description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          method="post"
          novalidate
          use:enhance={({ cancel }) => {
            const error = validate();
            if (error) {
              fieldError = error;
              cancel();
              return;
            }
            fieldError = "";
            loading = true;
            return async ({ update }) => {
              loading = false;
              await update();
            };
          }}
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1.5">
            <Label for="email">{m.auth_forgot_email_label()}</Label>
            <div class="relative">
              <Mail
                class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={m.auth_forgot_email_placeholder()}
                autocomplete="email"
                bind:value={email}
                aria-invalid={!!(fieldError || form?.fieldError)}
                class="pl-9"
              />
            </div>
            {#if fieldError || form?.fieldError}
              <p class="text-destructive text-xs">
                {fieldError || form?.fieldError}
              </p>
            {/if}
          </div>

          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? m.auth_forgot_submit_loading() : m.auth_forgot_submit()}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <Button
            variant="link"
            href="/login"
            class="text-muted-foreground h-auto p-0 text-sm"
          >
            <MoveLeft class="mr-1.5 h-3.5 w-3.5" />
            {m.auth_forgot_back_to_login()}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
