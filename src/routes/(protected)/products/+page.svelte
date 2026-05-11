<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { enhance } from "$app/forms";

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

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  let open = $state(false);
  let maxLicenses = $state<number | undefined>(undefined);

  $effect(() => {
    if (form?.errors && !form.success) {
      open = true;
      if (form.data?.maxLicensesPerUser) {
        maxLicenses = Number(form.data.maxLicensesPerUser);
      }
    }
  });
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
    <form
      method="POST"
      action="?/createProduct"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            open = false;
            maxLicenses = undefined;
          }
        };
      }}
    >
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
              value={form?.data?.name ?? ""}
              required
            />
            {#if form?.errors?.name}
              <Field.Error>{form.errors.name[0]}</Field.Error>
            {/if}
          </Field.Field>

          <Field.Field class="gap-2">
            <Field.Label for="description">{m.products_popup_add_description_label()}</Field.Label>
            <Textarea
              id="description"
              name="description"
              class="resize-none"
              placeholder={m.products_popup_add_description_placeholder()}
              value={String(form?.data?.description ?? "")}
            />
            {#if form?.errors?.description}
              <Field.Error>{form.errors.description[0]}</Field.Error>
            {/if}
          </Field.Field>

          <NumberStepperInput
            id="maxlicenses"
            name="maxLicensesPerUser"
            bind:value={maxLicenses}
            label={m.products_popup_add_max_licenses_label()}
            error={form?.errors?.maxLicensesPerUser?.[0]}
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
              checked={form?.data?.requiresApproval === "on"}
            />
          </Field.Field>

          <div class="flex justify-between gap-3">
            <Button variant="secondary" class="flex-1" onclick={() => (open = false)} type="button">
              {m.products_popup_add_cancel()}
            </Button>
            <Button class="flex-1" type="submit">
              {m.products_popup_add_submit()}
            </Button>
          </div>
        </Field.Group>
      </Field.Set>
    </form>
  </div>
</Modal>
