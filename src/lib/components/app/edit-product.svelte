<script lang="ts">
  import { SquarePen } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { stringProxy, superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

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
  import { updateProductSchema } from "$lib/schemas/products";

  type EditableProduct = {
    id: string;
    name: string;
  };

  let { product, form }: { product: EditableProduct; form: SuperValidated<Infer<typeof updateProductSchema>> } =
    $props();

  let open = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(updateProductSchema),
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      } else if (form.valid) {
        const nextState = {
          productId: product.id,
          name: form.data.name,
          description: form.data.description,
          maxLicensesPerUser: form.data.maxLicensesPerUser,
          requiresApproval: form.data.requiresApproval,
        };

        open = false;
        sf.reset({
          id: `update-product-${product.id}`,
          data: nextState,
          newState: nextState,
        });
        toast.success(m.products_edit_success({ name: form.data.name }));
      }
    },
  });

  const { form: formData, errors, enhance, submitting } = sf;
  const descriptionValue = stringProxy(sf, "description", { empty: "null" });
</script>

<AppDialog
  bind:open
  title={m.products_edit_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.products_action_edit()}
>
  {#snippet description()}
    {m.products_edit_dialog_description({ name: product.name })}
  {/snippet}

  {#snippet trigger()}
    <SquarePen class="h-4 w-4 text-gray-500" />
  {/snippet}

  <form method="POST" action="?/updateProduct" use:enhance class="grid gap-5">
    <input type="hidden" name="productId" bind:value={$formData.productId} />

    <Field.Field class="gap-2">
      <Field.Label for={`product-name-${product.id}`}>
        {m.products_popup_add_name_label()}
        <span class="text-destructive">*</span>
      </Field.Label>
      <Input
        id={`product-name-${product.id}`}
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
      <Field.Label for={`product-description-${product.id}`}>{m.products_popup_add_description_label()}</Field.Label>
      <Textarea
        id={`product-description-${product.id}`}
        name="description"
        class="resize-none"
        placeholder={m.products_popup_add_description_placeholder()}
        bind:value={$descriptionValue}
        aria-invalid={$errors.description ? "true" : undefined}
      />
      {#if $errors.description}
        <Field.Error>{$errors.description[0]}</Field.Error>
      {/if}
    </Field.Field>

    <NumberStepperInput
      id={`product-max-licenses-${product.id}`}
      name="maxLicensesPerUser"
      bind:value={$formData.maxLicensesPerUser}
      label={m.products_popup_add_max_licenses_label()}
      error={$errors.maxLicensesPerUser?.[0]}
      description={m.products_popup_add_max_licenses_description()}
    />

    <Field.Field class="align-center flex-row gap-2">
      <div class="flex-col">
        <Label for={`product-approval-${product.id}`} class="pb-1">
          {m.products_popup_add_requires_approval_label()}
        </Label>
        <Description class="text-muted-foreground text-xs">
          {m.products_popup_add_requires_approval_description()}
        </Description>
      </div>
      <Switch
        id={`product-approval-${product.id}`}
        name="requiresApproval"
        class="self-center"
        bind:checked={$formData.requiresApproval}
      />
    </Field.Field>

    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.products_popup_add_cancel()}
      </Button>
      <Button type="submit" class="flex-1" disabled={$submitting}>{m.products_edit_submit()}</Button>
    </div>
  </form>
</AppDialog>
