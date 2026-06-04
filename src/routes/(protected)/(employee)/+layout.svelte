<script lang="ts">
  import { FileKey, History, LayoutDashboard } from "@lucide/svelte";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import Navigation from "$lib/components/app/navigation.svelte";
  import { m } from "$lib/paraglide/messages.js";

  let { data, children } = $props();

  const pages = [
    { name: m.navigation_request_license(), href: resolve("/request"), icon: LayoutDashboard },
    { name: m.navigation_license_history(), href: resolve("/my-licenses"), icon: FileKey },
    { name: m.navigation_license_events(), href: resolve("/license-history"), icon: History },
  ];
</script>

<div class="flex h-dvh overflow-hidden">
  <Navigation user={data.user}>
    {#each pages as navPage (navPage.name)}
      {@const isActive = page.url.pathname === navPage.href || page.url.pathname.startsWith(`${navPage.href}/`)}
      <a
        href={navPage.href}
        aria-current={isActive ? "page" : undefined}
        class={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors md:flex-none md:flex-row md:gap-2 md:rounded-md md:px-3 md:py-3 md:text-sm md:font-medium ${
          isActive
            ? "text-primary md:bg-primary md:hover:bg-primary/90 md:text-white md:hover:text-white"
            : "text-muted-foreground hover:text-foreground md:text-gray-700 md:hover:bg-gray-100 md:hover:text-gray-900"
        }`}
      >
        <navPage.icon class="h-6 w-6 md:h-4 md:w-4" />
        {navPage.name}
      </a>
    {/each}
  </Navigation>

  <div class="min-h-0 flex-1 overflow-hidden pb-16 md:pb-0">
    {@render children?.()}
  </div>
</div>
