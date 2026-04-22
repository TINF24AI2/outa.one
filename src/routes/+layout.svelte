<script lang="ts">
import { resolve } from '$app/paths';
import { page } from '$app/state';
import type { Pathname } from '$app/types';
import { locales, localizeHref } from '$lib/paraglide/runtime';
import './layout.css';
import logo from '$lib/assets/logo.svg?raw';

let { children } = $props();

const logoInner = logo.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const wrappedFaviconSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="56" height="56" rx="14" fill="#2563EB"/><g transform="translate(7 7) scale(1.4)">${logoInner}</g></svg>`;

const favicon = `data:image/svg+xml,${encodeURIComponent(wrappedFaviconSvg)}`;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
  {#each locales as locale (locale)}
    <a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
      >{locale}</a
    >
  {/each}
</div>
