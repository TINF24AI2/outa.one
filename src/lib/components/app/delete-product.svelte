<script lang="ts">
  import { Trash2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages.js";
  import { deleteProductSchema } from "$lib/schemas/products";

  type DeletableProduct = {
    name: string;
    licenseCount: number;
    totalSeats: number;
  };

  let { product, form }: { product: DeletableProduct; form: SuperValidated<Infer<typeof deleteProductSchema>> } =
    $props();

  let open = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(deleteProductSchema),
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        open = false;
        toast.success(m.products_delete_success({ name: product.name }));
      }
    },
  });

  const { form: formData, enhance, submitting } = sf;
</script>

<AppDialog
  bind:open
  title={m.products_delete_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.products_action_delete()}
>
  {#snippet description()}
    {m.products_delete_dialog_description({ name: product.name })}
  {/snippet}

  {#snippet trigger()}
    <Trash2 class="h-4 w-4 text-red-500" />
  {/snippet}

  <form method="post" action="?/deleteProduct" use:enhance class="grid gap-6">
    <input type="hidden" name="productId" bind:value={$formData.productId} />

    <div class="grid gap-3">
      <h3 class="font-semibold">{m.products_delete_effects_title()}</h3>
      <ul class="list-inside list-disc text-xs text-gray-500">
        <li>{product.licenseCount} {m.products_delete_effect_license_keys()}</li>
        <li>{product.totalSeats} {m.products_delete_effect_license_seats()}</li>
        <li>{m.products_delete_effect_assignments()}</li>
      </ul>
    </div>

    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.products_popup_add_cancel()}
      </Button>
      <Button type="submit" variant="destructive" disabled={$submitting} class="flex-1">
        {m.products_delete_submit()}
      </Button>
    </div>
  </form>
</AppDialog>
