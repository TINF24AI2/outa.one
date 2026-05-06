<script lang="ts">
import { Eye, EyeOff } from '@lucide/svelte';
import { enhance } from '$app/forms';
import logo from '$lib/assets/logo.svg';
import { Alert, AlertDescription } from '$lib/components/ui/alert';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Separator } from '$lib/components/ui/separator';
import { DEMO_PASSWORD, DEMO_USERS } from '$lib/demo-users';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let loading = $state(false);
let email = $state('');
let password = $state('');
let showPassword = $state(false);
let fieldErrors = $state<{ email?: string; password?: string }>({});
type FieldErrors = { email?: string; password?: string };

const demoUsers = DEMO_USERS.map((u) => ({
  role: u.role === 'admin' ? 'Admin' : 'Employee',
  email: u.email,
}));

const serverFieldErrors = $derived((form?.fieldErrors ?? {}) as FieldErrors);

function validate() {
  const errors: typeof fieldErrors = {};
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return errors;
}
</script>

<div
  class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12"
>
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
      <CardTitle class="text-xl">Welcome back</CardTitle>
      <CardDescription>Sign in to access the License Portal</CardDescription>
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
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autocomplete="email"
            bind:value={email}
            aria-invalid={!!(fieldErrors.email || serverFieldErrors.email)}
          />
          {#if fieldErrors.email}
            <p class="text-destructive text-xs">
              {fieldErrors.email ?? serverFieldErrors.email}
            </p>
          {/if}
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="password">Password</Label>
          <div class="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autocomplete="current-password"
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
          {/if}
        </div>

        {#if form?.message}
          <Alert variant="destructive">
            <AlertDescription>{form.message}</AlertDescription>
          </Alert>
        {/if}

        <Button type="submit" class="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <Button
          variant="link"
          class="primary h-auto p-0 text-sm"
          href="/forgot-password"
        >
          Forgot your password?
        </Button>
      </div>
    </CardContent>

    {#if data.hasDemoUsers}
      <CardFooter class="flex-col gap-3">
        <Separator />
        <p class="text-muted-foreground text-xs font-medium tracking-wide">
          Demo Credentials
        </p>
        <div class="w-full space-y-2">
          {#each demoUsers as { role, email: demoEmail }}
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">{role}:</span>
              <span class="font-mono text-xs">{demoEmail}</span>
            </div>
          {/each}
        </div>
        <p class="text-muted-foreground text-xs font-medium tracking-wide">
          Password: <span class="font-mono">{DEMO_PASSWORD}</span>
        </p>
      </CardFooter>
    {/if}
  </Card>
</div>
