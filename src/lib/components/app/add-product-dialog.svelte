<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { toast } from "svelte-sonner";
  import { stringProxy, superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { Infer } from "zod";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import NumberStepperInput from "$lib/components/app/number-stepper-input.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Description } from "$lib/components/ui/dialog";
  import * as Field from "$lib/components/ui/field/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { createProductSchema } from "$lib/schemas/products";

  let {
    form,
    open = $bindable(false),
  }: {
    form: SuperValidated<Infer<typeof createProductSchema>>;
    open?: boolean;
  } = $props();

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(createProductSchema),
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        const name = form.data.name;
        open = false;
        sf.reset();
        toast.success(m.products_create_success({ name }));
      }
    },
  });
  const { form: formData, errors, enhance, submitting } = sf;
  const description = stringProxy(sf, "description", { empty: "null" });
</script>

<AppDialog bind:open title={m.products_popup_add_create_legend()} triggerClass={buttonVariants({ variant: "default" })}>
  {#snippet trigger()}
    <PlusIcon />
    {m.products_add_button()}
  {/snippet}

  <form method="POST" action="?/createProduct" use:enhance class="grid gap-5">
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
        bind:value={$formData.name}
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
      bind:value={$formData.maxLicensesPerUser}
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
      <Switch id="reqapproval" name="requiresApproval" class="self-center" bind:checked={$formData.requiresApproval} />
    </Field.Field>

    <div class="flex justify-between gap-3">
      <Button variant="secondary" class="flex-1" onclick={() => (open = false)} type="button">
        {m.products_popup_add_cancel()}
      </Button>
      <Button class="flex-1" type="submit" disabled={$submitting}>{m.products_popup_add_submit()}</Button>
    </div>
  </form>
</AppDialog>
