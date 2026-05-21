<script lang="ts">
  import { page } from "$app/state";

  import AddProductDialog from "$lib/components/app/add-product-dialog.svelte";
  import PageHeader from "$lib/components/app/page-header.svelte";
  import ProductList from "$lib/components/app/product-list.svelte";
  import { m } from "$lib/paraglide/messages.js";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let initialDialogOpen = $state(page.url.searchParams.get("add") === "1");
</script>

<svelte:head>
  <title>{m.products_meta_title()}</title>
  <meta name="products" content={m.meta_description()} />
</svelte:head>

<div class="flex w-full flex-col">
  <PageHeader title={m.products_title()} subtitle={m.products_subtitle()}>
    <AddProductDialog form={data.form} bind:open={initialDialogOpen} />
  </PageHeader>

  <div class="mx-auto w-full max-w-7xl">
    <ProductList />
  </div>
</div>
