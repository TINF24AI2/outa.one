<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { stringProxy, superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import NumberStepperInput from "$lib/components/app/number-stepper-input.svelte";
  import Modal from "$lib/components/modal.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Description } from "$lib/components/ui/dialog";
  import * as Field from "$lib/components/ui/field/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { createProductSchema } from "$lib/schemas/products";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let open = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(data.form, {
    validators: zodClient(createProductSchema),
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
  const description = stringProxy(sf, "description", { empty: "null" });
</script>

<svelte:head>
  <title>{m.products_meta_title()}</title>
  <meta name="products" content={m.meta_description()} />
</svelte:head>

<Button onclick={() => (open = true)}>
  <PlusIcon />
  {m.products_add_button()}
</Button>

<Modal bind:open class="h-auto bg-white text-black">
  <div class="w-full max-w-md">
    <form method="POST" action="?/createProduct" use:enhance>
      <Field.Set class="gap-6">
        <Field.Legend>{m.products_popup_add_create_legend()}</Field.Legend>
        <Field.Separator class="-mx-6" />
        <Field.Group class="gap-5">
          <Field.Field class="gap-2">
            <Field.Label for="productname">
              {m.products_popup_add_name_label()}
              <span class="text-destructive">*</span>
            </Field.Label>
            <Input
              id="productname"
              name="name"
              type="text"
              placeholder={m.products_popup_add_name_placeholder()}
              bind:value={$form.name}
              required
              aria-invalid={$errors.name ? "true" : undefined}
            />
            {#if $errors.name}
              <Field.Error>{$errors.name[0]}</Field.Error>
            {/if}
          </Field.Field>

          <Field.Field class="gap-2">
            <Field.Label for="description">{m.products_popup_add_description_label()}</Field.Label>
            <Textarea
              id="description"
              name="description"
              class="resize-none"
              placeholder={m.products_popup_add_description_placeholder()}
              bind:value={$description}
              aria-invalid={$errors.description ? "true" : undefined}
            />
            {#if $errors.description}
              <Field.Error>{$errors.description[0]}</Field.Error>
            {/if}
          </Field.Field>

          <NumberStepperInput
            id="maxlicenses"
            name="maxLicensesPerUser"
            bind:value={$form.maxLicensesPerUser}
            label={m.products_popup_add_max_licenses_label()}
            error={$errors.maxLicensesPerUser?.[0]}
            description={m.products_popup_add_max_licenses_description()}
          />

          <Field.Field class="align-center flex-row gap-2">
            <div class="flex-col">
              <Label for="reqapproval" class="pb-1">{m.products_popup_add_requires_approval_label()}</Label>
              <Description class="text-muted-foreground text-xs">
                {m.products_popup_add_requires_approval_description()}
              </Description>
            </div>
            <Switch
              id="reqapproval"
              name="requiresApproval"
              class="self-center"
              bind:checked={$form.requiresApproval}
            />
          </Field.Field>

          <div class="flex justify-between gap-3">
            <Button variant="secondary" class="flex-1" onclick={() => (open = false)} type="button">
              {m.products_popup_add_cancel()}
            </Button>
            <Button class="flex-1" type="submit" disabled={$submitting}>{m.products_popup_add_submit()}</Button>
          </div>
        </Field.Group>
      </Field.Set>
    </form>
  </div>
</Modal>
