<script lang="ts">
import { CircleX, Eye, EyeOff, Link2Off, UserPlus } from '@lucide/svelte';
import { enhance } from '$app/forms';
import { Alert, AlertDescription } from '$lib/components/ui/alert';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let loading = $state(false);
let showPassword = $state(false);
let showConfirm = $state(false);
let name = $state('');
let password = $state('');
let confirmPassword = $state('');
let fieldErrors = $state<{ name?: string; password?: string; confirmPassword?: string }>({});

const isError = $derived('error' in data);

function validate() {
  const errors: typeof fieldErrors = {};
  if (!name.trim()) {
    errors.name = 'Full name is required';
  }
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
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  {#if isError}
    <!-- Invalid / missing invite -->
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          {#if data.error === 'no_invite'}
            <Link2Off class="text-destructive h-7 w-7" />
          {:else}
            <CircleX class="text-destructive h-7 w-7" />
          {/if}
        </div>
        <CardTitle class="text-xl">
          {data.error === 'no_invite' ? 'Invite required' : 'Invite expired'}
        </CardTitle>
        <CardDescription>
          {#if data.error === 'no_invite'}
            Sign-up is by invitation only. Contact an admin to receive an invite link.
          {:else}
            This invite link has expired or has already been used. Ask an admin to send you a new one.
          {/if}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex justify-center">
        <Button href="/login" variant="outline" class="w-full">Back to login</Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Valid invite — sign-up form -->
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center justify-items-center text-center">
        <div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
          <UserPlus class="h-7 w-7 text-white" />
        </div>
        <CardTitle class="text-xl">Welcome to License Portal</CardTitle>
        <CardDescription>
          You've been invited to join as<br />
          <span class="text-foreground font-medium">{data.email}</span>
        </CardDescription>
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
            <Label for="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              autocomplete="name"
              bind:value={name}
              aria-invalid={!!fieldErrors.name}
            />
            {#if fieldErrors.name}
              <p class="text-destructive text-xs">{fieldErrors.name}</p>
            {/if}
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="password">Create password</Label>
            <div class="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autocomplete="new-password"
                bind:value={password}
                aria-invalid={!!fieldErrors.password}
                class="pr-10"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
              </button>
            </div>
            {#if fieldErrors.password}
              <p class="text-destructive text-xs">{fieldErrors.password}</p>
            {:else}
              <p class="text-muted-foreground text-xs">Must be at least 8 characters</p>
            {/if}
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="confirmPassword">Confirm password</Label>
            <div class="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                autocomplete="new-password"
                bind:value={confirmPassword}
                aria-invalid={!!fieldErrors.confirmPassword}
                class="pr-10"
              />
              <button
                type="button"
                onclick={() => (showConfirm = !showConfirm)}
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {#if showConfirm}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
              </button>
            </div>
            {#if fieldErrors.confirmPassword}
              <p class="text-destructive text-xs">{fieldErrors.confirmPassword}</p>
            {/if}
          </div>

          {#if form?.message}
            <Alert variant="destructive">
              <AlertDescription>{form.message}</AlertDescription>
            </Alert>
          {/if}

          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  {/if}
</div>
