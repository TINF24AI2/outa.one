<script lang="ts">
	import { FileKey, Menu, Package, Users } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import Navigation from '$lib/components/app/navigation.svelte';

	let { data, children } = $props();

	let pages = $derived(() => {
		if (data.user.role === 'admin') {
			return [
				{ name: 'Dashboard', href: resolve('/dashboard'), icon: Menu },
				{ name: 'Products', href: resolve('/products'), icon: Package },
				{ name: 'Licenses', href: resolve('/licenses'), icon: FileKey },
				{ name: 'Users', href: resolve('/users'), icon: Users },
			];
		} else {
			return [{ name: 'Dashboard', href: resolve('/dashboard'), icon: Menu }];
		}
	});
</script>

<div class="flex h-screen overflow-hidden">
	<Navigation user={data.user}>
		{#each pages() as navPage (navPage.name)}
			{@const isActive = page.url.pathname === navPage.href || page.url.pathname.startsWith(`${navPage.href}/`)}
			<a
				href={navPage.href}
				aria-current={isActive ? 'page' : undefined}
				class={`flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium transition-colors ${
					isActive
						? 'bg-primary hover:bg-primary/90 text-white hover:text-white'
						: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
				}`}
			>
				<navPage.icon strokeWidth="1.25" />
				{navPage.name}
			</a>
		{/each}
	</Navigation>

	{@render children?.()}
</div>
