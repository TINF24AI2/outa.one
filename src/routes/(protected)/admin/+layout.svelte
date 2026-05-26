<script lang="ts">
  import { FileKey, LayoutDashboard, Package, Users } from "@lucide/svelte";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import Navigation from "$lib/components/app/navigation.svelte";
  import { m } from "$lib/paraglide/messages.js";

  let { data, children } = $props();

  const pages = [
    { name: m.dashboard_title(), href: resolve("/admin/dashboard"), icon: LayoutDashboard },
    { name: m.products_title(), href: resolve("/admin/products"), icon: Package },
    { name: m.licenses_title(), href: resolve("/admin/licenses"), icon: FileKey },
    { name: m.users_title(), href: resolve("/admin/users"), icon: Users },
  ];
</script>

<div class="flex h-screen overflow-hidden">
  <Navigation user={data.user}>
    {#each pages as navPage (navPage.name)}
      {@const isActive = page.url.pathname === navPage.href || page.url.pathname.startsWith(`${navPage.href}/`)}
      <a
        href={navPage.href}
        aria-current={isActive ? "page" : undefined}
        class={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors md:flex-row md:gap-2 md:rounded-md md:px-3 md:py-3 md:text-sm md:font-medium ${
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
