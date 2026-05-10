<script lang="ts">
  import { CircleCheckBig, Mail, MoveLeft } from "@lucide/svelte";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import logo from "$lib/assets/logo.svg";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { m } from "$lib/paraglide/messages.js";
  import { forgotPasswordSchema } from "$lib/schemas/auth";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const { form, errors, enhance, submitting, message } = superForm(data.form, {
    validators: zodClient(forgotPasswordSchema()),
  });
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  {#if $message?.success}
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CircleCheckBig class="h-7 w-7 text-green-600" />
        </div>
        <CardTitle class="text-xl">{m.auth_forgot_success_title()}</CardTitle>
        <CardDescription>
          {m.auth_forgot_success_description()}
          <br />
          <span class="text-foreground font-semibold">{$message.email}</span>
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
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <img src={logo} alt={m.auth_forgot_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
        </div>
        <CardTitle class="text-xl">{m.auth_forgot_title()}</CardTitle>
        <CardDescription>{m.auth_forgot_description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form method="post" use:enhance class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label for="email">{m.auth_forgot_email_label()}</Label>
            <div class="relative">
              <Mail class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={m.auth_forgot_email_placeholder()}
                autocomplete="email"
                bind:value={$form.email}
                aria-invalid={!!$errors.email}
                class="pl-9"
              />
            </div>
            {#if $errors.email}
              <p class="text-destructive text-xs">{$errors.email}</p>
            {/if}
          </div>

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
      </CardContent>
    </Card>
  {/if}
</div>
