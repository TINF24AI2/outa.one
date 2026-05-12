<script lang="ts">
  import AddLicenseDialog from "$lib/components/app/add-license-dialog.svelte";
  import { m } from "$lib/paraglide/messages.js";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{m.licenses_popup_add_meta_title()}</title>
  <meta name="licenses" content={m.meta_description()} />
</svelte:head>

<AddLicenseDialog form={data.form} products={data.products} />
