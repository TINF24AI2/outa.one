<script lang="ts">
  import MinusIcon from "@lucide/svelte/icons/minus";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import { enhance } from "$app/forms";

  import Modal from "$lib/components/modal.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import { m } from "$lib/paraglide/messages.js";

  let { data, form } = $props();

  let open = $state(false);
  let productValue = $state("");
  let usageVolume = $state<number | undefined>(1);

  const productOptions = $derived(data.products.map((p) => ({ value: p.id, label: p.name })));

  $effect(() => {
    if (form?.errors && !form.success) {
      open = true;
      if (form.data?.productId) productValue = String(form.data.productId);
      if (form.data?.usageVolume) usageVolume = Number(form.data.usageVolume);
    }
  });
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
    <form
      method="POST"
      action="?/createLicense"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            open = false;
            productValue = "";
            usageVolume = 1;
          }
        };
      }}
    >
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
              bind:value={productValue}
              options={productOptions}
              placeholder={m.licenses_popup_add_product_placeholder()}
              contentClass="w-full"
              class="cursor-pointer"
            />
            <input type="hidden" name="productId" value={productValue} />
            {#if form?.errors?.productId}
              <Field.Error>{form.errors.productId[0]}</Field.Error>
            {/if}
          </Field.Field>
          <Field.Field class="gap-2">
            <Field.Label for="usagevolume">
              {m.licenses_popup_add_usage_volume_label()}
              <span class="text-destructive">*</span>
            </Field.Label>
            <div
              class="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-10 overflow-hidden rounded-md border shadow-xs focus-within:ring-3"
            >
              <input
                id="usagevolume"
                name="usageVolume"
                type="number"
                min="0"
                bind:value={usageVolume}
                class="w-full min-w-0 [appearance:textfield] bg-transparent px-2.5 py-1 text-base outline-none md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                required
              />
              <div class="hight-10 flex flex-col p-1">
                <button
                  type="button"
                  onclick={() => (usageVolume = (usageVolume ?? 0) + 1)}
                  class="text-muted-foreground flex flex-1 cursor-pointer items-center justify-center px-2 text-sm leading-none"
                  aria-label={m.common_increase()}
                >
                  <PlusIcon class="size-4" />
                </button>
                <button
                  type="button"
                  onclick={() => (usageVolume = Math.max(0, (usageVolume ?? 0) - 1))}
                  class="text-muted-foreground flex flex-1 cursor-pointer items-center justify-center px-2 text-sm leading-none"
                  aria-label={m.common_decrease()}
                >
                  <MinusIcon class="size-4" />
                </button>
              </div>
            </div>
            {#if form?.errors?.usageVolume}
              <Field.Error>{form.errors.usageVolume[0]}</Field.Error>
            {/if}
            <Field.Description class="text-muted-foreground text-xs">
              {m.licenses_popup_add_usage_volume_description()}
            </Field.Description>
          </Field.Field>
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
              value={String(form?.data?.key ?? "")}
              required
            />
            {#if form?.errors?.key}
              <Field.Error>{form.errors.key[0]}</Field.Error>
            {/if}
          </Field.Field>
          <div class="flex justify-between gap-3">
            <Button variant="secondary" class="flex-1" onclick={() => (open = false)} type="button">
              {m.licenses_popup_add_cancel()}
            </Button>
            <Button class="flex-1" type="submit">{m.licenses_popup_add_submit()}</Button>
          </div>
        </Field.Group>
      </Field.Set>
    </form>
  </div>
</Modal>
