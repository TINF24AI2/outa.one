<script lang="ts">
  import { page } from "$app/state";

  import AddProductDialog from "$lib/components/app/add-product-dialog.svelte";
  import { m } from "$lib/paraglide/messages.js";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let initialDialogOpen = $state(page.url.searchParams.get("add") === "1");
</script>

<svelte:head>
  <title>{m.products_meta_title()}</title>
  <meta name="products" content={m.meta_description()} />
</svelte:head>

<AddProductDialog form={data.form} bind:open={initialDialogOpen} />
