<script lang="ts">
  import { ArrowRightLeft, CircleUserRound, LogOut } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import logo from "$lib/assets/logo.svg";
  import { authClient } from "$lib/authClient";
  import { Button } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages.js";
  import { getInitials } from "$lib/user-management";

  type Props = {
    user: { name: string; email: string; role?: string | null };
    children?: import("svelte").Snippet;
  };

  let { user, children }: Props = $props();

  const signOut = async () => {
    await authClient.signOut();
    await goto(resolve("/login"));
  };

  const isAdminView = $derived(() => page.url.pathname.startsWith("/admin"));

  const switchViewLink = () => {
    if (!browser) {
      return "#";
    }

    if (isAdminView()) {
      return resolve("/dashboard");
    } else {
      return resolve("/admin/dashboard");
    }
  };

  let accountOpen = $state(false);
</script>

<!-- Desktop sidebar -->
<aside class="bg-background hidden w-64 shrink-0 flex-col border-r md:flex">
  <!-- App header -->
  <div class="flex items-center gap-3 border-b px-4 py-3">
    <div class="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      <img src={logo} alt={m.navigation_logo_alt()} class="h-5 w-5 object-contain brightness-0 invert" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold">{m.app_license_portal()}</p>
      <p class="text-muted-foreground truncate text-xs">
        {isAdminView() ? m.navigation_adminView() : m.navigation_employeeView()}
      </p>
    </div>
  </div>

  <!-- Nav slot -->
  <nav class="flex h-full flex-col gap-1 px-2 py-4">
    {@render children?.()}
  </nav>

  <!-- User footer -->
  <div class="space-y-2 border-t px-4 py-4">
    <div class="flex items-center gap-3">
      <div
        class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      >
        {getInitials(user.name)}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{user.name}</p>
        <p class="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
    </div>

    <div class="mt-4 flex flex-col">
      {#if user.role === "admin"}
        <div class="flex flex-col items-start gap-2">
          <Button variant="ghost" class="w-full justify-start gap-2 px-2 text-gray-700" href={switchViewLink()}>
            <ArrowRightLeft class="h-4 w-4" />
            {isAdminView() ? m.navigation_switchToEmployee() : m.navigation_switchToAdmin()}
          </Button>
        </div>
      {/if}

      <Button variant="ghost" class="w-full justify-start gap-2 px-2 text-gray-700" onclick={signOut}>
        <LogOut class="h-4 w-4" />
        {m.navigation_logout()}
      </Button>
    </div>
  </div>
</aside>

<!-- Mobile bottom nav -->
<nav
  class="bg-background fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-2 py-1 md:hidden"
>
  {@render children?.()}

  <!-- Account button -->
  <div class="relative">
    {#if accountOpen}
      <!-- Click-outside backdrop -->
      <button class="fixed inset-0 z-40" onclick={() => (accountOpen = false)} aria-label="Close account menu"></button>

      <!-- Popup -->
      <div class="bg-popover absolute right-0 bottom-full z-50 mb-3 min-w-52 rounded-xl border shadow-lg">
        <div class="px-4 py-3">
          <p class="text-sm leading-tight font-semibold">{user.name}</p>
          <p class="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <div class="border-t px-2 py-2">
          <Button variant="ghost" class="w-full justify-start gap-2 px-2 text-gray-700" href={switchViewLink()}>
            <ArrowRightLeft class="h-4 w-4" />
            {isAdminView() ? m.navigation_switchToEmployee() : m.navigation_switchToAdmin()}
          </Button>
          <Button variant="ghost" class="h-9 w-full justify-start gap-2 px-2 text-gray-700" onclick={signOut}>
            <LogOut class="h-4 w-4" />
            {m.navigation_logout()}
          </Button>
        </div>
      </div>
    {/if}

    <button
      onclick={() => (accountOpen = !accountOpen)}
      class="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors"
    >
      <CircleUserRound class="h-6 w-6" />
      <span>{m.navigation_account()}</span>
    </button>
  </div>
</nav>
