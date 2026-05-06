<script lang="ts">
import { CircleUserRound, LogOut } from '@lucide/svelte';
import { enhance } from '$app/forms';
import logo from '$lib/assets/logo.svg';
import { Button } from '$lib/components/ui/button';
import { m } from '$lib/paraglide/messages.js';

type Props = {
  user: { name: string; email: string; role?: string | null };
  children?: import('svelte').Snippet;
};

let { user, children }: Props = $props();

const roleLabel = $derived(user.role === 'admin' ? m.role_admin() : m.role_employee());

const initials = $derived(
  user.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

let accountOpen = $state(false);
</script>

<!-- Desktop sidebar -->
<aside class="bg-background hidden md:flex w-64 shrink-0 flex-col border-r">
  <!-- App header -->
  <div class="flex items-center gap-3 border-b px-4 py-3">
    <div
      class="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
    >
      <img
        src={logo}
        alt={m.sidebar_logo_alt()}
        class="h-5 w-5 object-contain brightness-0 invert"
      />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold">{m.app_license_portal()}</p>
      <p class="text-muted-foreground truncate text-xs">{roleLabel}</p>
    </div>
  </div>

  <!-- Nav slot -->
  <nav class="flex-1">
    {@render children?.()}
  </nav>

  <!-- User footer -->
  <div class="space-y-2 border-t px-4 py-4">
    <div class="flex items-center gap-3">
      <div
        class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      >
        {initials}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{user.name}</p>
        <p class="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
    </div>

    <form method="post" action="?/signOut" use:enhance>
      <Button
        variant="ghost"
        class="w-full justify-start gap-2 px-2"
        type="submit"
      >
        <LogOut class="h-4 w-4" />
        {m.sidebar_logout()}
      </Button>
    </form>
  </div>
</aside>

<!-- Mobile bottom nav -->
<nav
  class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t flex items-center justify-around px-2 py-1"
>
  {@render children?.()}

  <!-- Account button -->
  <div class="relative">
    {#if accountOpen}
      <!-- Click-outside backdrop -->
      <button
        class="fixed inset-0 z-40"
        onclick={() => (accountOpen = false)}
        aria-label="Close account menu"
      ></button>

      <!-- Popup -->
      <div
        class="absolute bottom-full mb-3 right-0 z-50 min-w-52 rounded-xl border bg-popover shadow-lg"
      >
        <div class="px-4 py-3">
          <p class="text-sm font-semibold leading-tight">{user.name}</p>
          <p class="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <div class="border-t px-2 py-2">
          <form method="post" action="?/signOut" use:enhance>
            <Button
              variant="ghost"
              class="w-full justify-start gap-2 px-2 h-9"
              type="submit"
            >
              <LogOut class="h-4 w-4" />
              {m.sidebar_logout()}
            </Button>
          </form>
        </div>
      </div>
    {/if}

    <button
      onclick={() => (accountOpen = !accountOpen)}
      class="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors"
    >
      <CircleUserRound class="h-6 w-6" />
      <span>Account</span>
    </button>
  </div>
</nav>
