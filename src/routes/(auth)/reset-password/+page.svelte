<script lang="ts">
import { CircleCheckBig, Eye, EyeOff } from '@lucide/svelte';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import logo from '$lib/assets/logo.svg';
import { Alert, AlertDescription } from '$lib/components/ui/alert';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let loading = $state(false);
let password = $state('');
let confirmPassword = $state('');
let showPassword = $state(false);
let showConfirm = $state(false);
let fieldErrors = $state<{ password?: string; confirmPassword?: string }>({});

const serverFieldErrors = $derived(
  (form?.fieldErrors ?? {}) as {
    password?: string;
    confirmPassword?: string;
  },
);

function validate() {
  const errors: typeof fieldErrors = {};
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Must be at least 8 characters';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

$effect(() => {
  if (form?.success) {
    const timer = setTimeout(() => goto('/login'), 3000);
    return () => clearTimeout(timer);
  }
});
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
        <CardTitle class="text-xl">Password reset!</CardTitle>
        <CardDescription>
          Your password has been successfully reset. You can now sign in with
          your new password.
        </CardDescription>
      </CardHeader>
      <CardContent class="text-muted-foreground text-center text-sm">
        Redirecting to login page…
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
            alt="Outa Logo"
            class="h-8 w-8 object-contain brightness-0 invert"
          />
        </div>
        <CardTitle class="text-xl">Reset password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          method="post"
          novalidate
          use:enhance={({ cancel }) => {
            const errors = validate();
            if (Object.keys(errors).length > 0) {
              fieldErrors = errors;
              cancel();
              return;
            }
            fieldErrors = {};
            loading = true;
            return async ({ update }) => {
              loading = false;
              await update();
            };
          }}
          class="flex flex-col gap-4"
        >
          <input type="hidden" name="token" value={data.token} />

          <div class="flex flex-col gap-1.5">
            <Label for="password">New password</Label>
            <div class="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autocomplete="new-password"
                bind:value={password}
                aria-invalid={!!(
                  fieldErrors.password || serverFieldErrors.password
                )}
                class="pr-10"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye
                    class="h-4 w-4"
                  />{/if}
              </button>
            </div>
            {#if fieldErrors.password || serverFieldErrors.password}
              <p class="text-destructive text-xs">
                {fieldErrors.password ?? serverFieldErrors.password}
              </p>
            {:else}
              <p class="text-muted-foreground text-xs">
                Must be at least 8 characters
              </p>
            {/if}
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="confirmPassword">Confirm password</Label>
            <div class="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autocomplete="new-password"
                bind:value={confirmPassword}
                aria-invalid={!!(
                  fieldErrors.confirmPassword ||
                  serverFieldErrors.confirmPassword
                )}
                class="pr-10"
              />
              <button
                type="button"
                onclick={() => (showConfirm = !showConfirm)}
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {#if showConfirm}<EyeOff class="h-4 w-4" />{:else}<Eye
                    class="h-4 w-4"
                  />{/if}
              </button>
            </div>
            {#if fieldErrors.confirmPassword || serverFieldErrors.confirmPassword}
              <p class="text-destructive text-xs">
                {fieldErrors.confirmPassword ??
                  serverFieldErrors.confirmPassword}
              </p>
            {/if}
          </div>

          {#if form?.message}
            <Alert variant="destructive">
              <AlertDescription>{form.message}</AlertDescription>
            </Alert>
          {/if}

          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <Button
            variant="link"
            href="/login"
            class="text-muted-foreground h-auto p-0 text-sm"
          >
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
