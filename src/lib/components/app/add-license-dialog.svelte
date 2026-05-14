<script lang="ts">
  import UploadIcon from "@lucide/svelte/icons/upload";
  import { toast } from "svelte-sonner";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { Infer } from "zod";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import NumberStepperInput from "$lib/components/app/number-stepper-input.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { createLicenseSchema } from "$lib/schemas/licenses";

  type Product = { id: string; name: string };

  let { form, products }: { form: SuperValidated<Infer<typeof createLicenseSchema>>; products: Product[] } = $props();

  let open = $state(false);

  const productOptions = $derived(products.map((p) => ({ value: p.id, label: p.name })));

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(createLicenseSchema),
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        open = false;
        sf.reset();
        toast.success(m.licenses_create_success());
      }
    },
  });
  const { form: formData, errors, enhance, submitting } = sf;
</script>

<AppDialog bind:open title={m.licenses_popup_add_legend()} triggerClass={buttonVariants({ variant: "default" })}>
  {#snippet description()}
    {m.licenses_popup_add_description()}
  {/snippet}

  {#snippet trigger()}
    <UploadIcon />
    {m.licenses_upload_button()}
  {/snippet}

  <form method="POST" action="?/createLicense" use:enhance class="grid gap-5">
    <Field.Field class="gap-2">
      <Field.Label for="productname">
        {m.licenses_popup_add_product_label()}
        <span class="text-red-600">*</span>
      </Field.Label>
      <Combobox
        id="productname"
        bind:value={$formData.productId}
        options={productOptions}
        placeholder={m.licenses_popup_add_product_placeholder()}
        contentClass="w-full"
        class="cursor-pointer"
      />
      <input type="hidden" name="productId" bind:value={$formData.productId} />
      {#if $errors.productId}
        <Field.Error>{$errors.productId[0]}</Field.Error>
      {/if}
    </Field.Field>

    <NumberStepperInput
      id="usagevolume"
      name="usageVolume"
      bind:value={$formData.usageVolume}
      label={m.licenses_popup_add_usage_volume_label()}
      required
      error={$errors.usageVolume?.[0]}
      description={m.licenses_popup_add_usage_volume_description()}
    />

    <Field.Field class="gap-2">
      <Field.Label for="key">
        {m.licenses_popup_add_key_label()}
        <span class="text-destructive">*</span>
      </Field.Label>
      <Input
        id="key"
        name="key"
        type="text"
        placeholder={m.licenses_popup_add_key_placeholder()}
        bind:value={$formData.key}
        required
        aria-invalid={$errors.key ? "true" : undefined}
      />
      {#if $errors.key}
        <Field.Error>{$errors.key[0]}</Field.Error>
      {/if}
    </Field.Field>

    <div class="flex justify-between gap-3">
      <Button variant="secondary" class="flex-1" onclick={() => (open = false)} type="button">
        {m.licenses_popup_add_cancel()}
      </Button>
      <Button class="flex-1" type="submit" disabled={$submitting}>{m.licenses_popup_add_submit()}</Button>
    </div>
  </form>
</AppDialog>
