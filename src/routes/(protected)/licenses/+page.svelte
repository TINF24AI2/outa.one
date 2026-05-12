<script lang="ts">
  import UploadIcon from "@lucide/svelte/icons/upload";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import NumberStepperInput from "$lib/components/app/number-stepper-input.svelte";
  import Modal from "$lib/components/modal.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { createLicenseSchema } from "$lib/schemas/licenses";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let open = $state(false);

  const productOptions = $derived(data.products.map((p) => ({ value: p.id, label: p.name })));

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(createLicenseSchema),
    onUpdate({ result }) {
      if (result.type === "success") {
        open = false;
        sf.reset();
        return;
      }

      open = true;
    },
  });
  const { form, errors, enhance, submitting } = sf;
</script>

<svelte:head>
  <title>{m.licenses_popup_add_meta_title()}</title>
  <meta name="licenses" content={m.meta_description()} />
</svelte:head>

<Button onclick={() => (open = true)}>
  <UploadIcon />
  {m.licenses_upload_button()}
</Button>

<Modal bind:open class="h-auto bg-white text-black">
  <div class="w-full max-w-md">
    <form method="POST" action="?/createLicense" use:enhance>
      <Field.Set class="gap-6">
        <Field.Group class="gap-1">
          <Field.Legend class="mb-0 pb-1">{m.licenses_popup_add_legend()}</Field.Legend>
          <Field.Description class="text-muted-foreground text-xs">
            {m.licenses_popup_add_description()}
          </Field.Description>
        </Field.Group>
        <Field.Separator class="-mx-6" />
        <Field.Group class="gap-5">
          <Field.Field class="gap-2">
            <Field.Label for="productname">
              {m.licenses_popup_add_product_label()}
              <span class="text-red-600">*</span>
            </Field.Label>
            <Combobox
              id="productname"
              bind:value={$form.productId}
              options={productOptions}
              placeholder={m.licenses_popup_add_product_placeholder()}
              contentClass="w-full"
              class="cursor-pointer"
            />
            <input type="hidden" name="productId" bind:value={$form.productId} />
            {#if $errors.productId}
              <Field.Error>{$errors.productId[0]}</Field.Error>
            {/if}
          </Field.Field>
          <NumberStepperInput
            id="usagevolume"
            name="usageVolume"
            bind:value={$form.usageVolume}
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
              bind:value={$form.key}
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
        </Field.Group>
      </Field.Set>
    </form>
  </div>
</Modal>
