<script lang="ts">
  import { ArrowRightLeft, ChevronsUpDown, CircleUserRound, LogOut, ScrollText } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import logo from "$lib/assets/logo.svg";
  import { authClient } from "$lib/authClient";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Separator } from "$lib/components/ui/separator";
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
      return resolve("/request");
    } else {
      return resolve("/admin/dashboard");
    }
  };

  let accountOpen = $state(false);
  let popoverOpen = $state(false);
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
  <div class="border-t">
    <Popover.Root bind:open={popoverOpen}>
      <Popover.Trigger
        class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-none"
      >
        <div
          class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        >
          {getInitials(user.name)}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{user.name}</p>
          <p class="text-muted-foreground truncate text-xs">{user.email}</p>
        </div>
        <ChevronsUpDown class="text-muted-foreground h-4 w-4 shrink-0" />
      </Popover.Trigger>
      <Popover.Content side="top" align="end" class="w-56 p-0">
        <div class="flex flex-col gap-1.5 py-2.5">
          <div class="px-3">
            <p class="text-sm font-semibold">{user.name}</p>
            <p class="text-muted-foreground text-xs">{user.email}</p>
          </div>
          <Separator />
          {#if user.role === "admin"}
            <div class="px-1">
              <Button
                variant="ghost"
                class="h-9 w-full justify-start gap-2 px-2 text-gray-700"
                href={switchViewLink()}
                onclick={() => (popoverOpen = false)}
              >
                <ArrowRightLeft class="h-4 w-4" />
                {isAdminView() ? m.navigation_switchToEmployee() : m.navigation_switchToAdmin()}
              </Button>
              <Button
                variant="ghost"
                class="h-9 w-full justify-start gap-2 px-2 text-gray-700"
                href={resolve("/admin/audit")}
                onclick={() => (popoverOpen = false)}
              >
                <ScrollText class="h-4 w-4" />
                {m.audit_title()}
              </Button>
            </div>
            <Separator />
          {/if}
          <div class="px-1">
            <Button
              variant="ghost"
              class="text-destructive hover:text-destructive h-9 w-full justify-start gap-2 px-2"
              onclick={signOut}
            >
              <LogOut class="h-4 w-4" />
              {m.navigation_logout()}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  </div>
</aside>

<!-- Mobile bottom nav -->
<nav class="bg-background fixed right-0 bottom-0 left-0 z-40 flex items-center border-t py-1 md:hidden">
  {@render children?.()}

  <!-- Account button -->
  <div class="relative flex min-w-0 flex-1 justify-center">
    {#if accountOpen}
      <!-- Click-outside backdrop -->
      <button class="fixed inset-0 z-40" onclick={() => (accountOpen = false)} aria-label="Close account menu"></button>

      <!-- Popup -->
      <div class="bg-popover absolute right-0 bottom-full z-50 mb-3 min-w-52 rounded-xl border shadow-lg">
        <div class="px-4 py-3">
          <p class="text-sm leading-tight font-semibold">{user.name}</p>
          <p class="text-muted-foreground text-xs">{user.email}</p>
        </div>
        {#if user.role === "admin"}
          <div class="border-t px-2 py-2">
            <Button variant="ghost" class="h-9 w-full justify-start gap-2 px-2 text-gray-700" href={switchViewLink()}>
              <ArrowRightLeft class="h-4 w-4" />
              {isAdminView() ? m.navigation_switchToEmployee() : m.navigation_switchToAdmin()}
            </Button>
            <Button
              variant="ghost"
              class="h-9 w-full justify-start gap-2 px-2 text-gray-700"
              href={resolve("/admin/audit")}
              onclick={() => (accountOpen = false)}
            >
              <ScrollText class="h-4 w-4" />
              {m.audit_title()}
            </Button>
          </div>
        {/if}
        <div class="border-t px-2 py-2">
          <Button
            variant="ghost"
            class="text-destructive hover:text-destructive h-9 w-full justify-start gap-2 px-2"
            onclick={signOut}
          >
            <LogOut class="h-4 w-4" />
            {m.navigation_logout()}
          </Button>
        </div>
      </div>
    {/if}

    <button
      onclick={() => (accountOpen = !accountOpen)}
      class="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 py-2 text-xs transition-colors"
    >
      <CircleUserRound class="h-6 w-6" />
      <span>{m.navigation_account()}</span>
    </button>
  </div>
</nav>
