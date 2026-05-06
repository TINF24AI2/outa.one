<script lang="ts">
import { LogOut } from '@lucide/svelte';
import { enhance } from '$app/forms';
import logo from '$lib/assets/logo.svg';
import { Button } from '$lib/components/ui/button';

type Props = {
  user: { name: string; email: string; role?: string | null };
  children?: import('svelte').Snippet;
};

let { user, children }: Props = $props();

const roleLabel = $derived(user.role === 'admin' ? 'Admin' : 'Employee');

const initials = $derived(
  user.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);
</script>

<aside class="bg-background flex w-64 shrink-0 flex-col border-r">
  <!-- App header -->
  <div class="flex items-center gap-3 border-b px-4 py-3">
    <div class="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
      <img src={logo} alt="Outa" class="h-5 w-5 object-contain brightness-0 invert" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold">License Portal</p>
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
      <div class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {initials}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{user.name}</p>
        <p class="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
    </div>

    <form method="post" action="?/signOut" use:enhance>
      <Button variant="ghost" class="w-full justify-start gap-2 px-2" type="submit">
        <LogOut class="h-4 w-4" />
        Logout
      </Button>
    </form>
  </div>
</aside>
