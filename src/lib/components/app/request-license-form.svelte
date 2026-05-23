<script lang="ts">
  import { Check, CheckCircle2, Clock, Copy } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";

  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { m } from "$lib/paraglide/messages.js";
  import { requestLicenseSchema, type ProductItem, type RequestLicenseInput } from "$lib/schemas/request-license";

  type Product = ProductItem;

  type ActionResult = {
    pending?: boolean;
    licenseKey?: string;
    productName?: string;
  };

  let {
    open = $bindable(false),
    product,
    initialForm,
  }: {
    open: boolean;
    product: Product | null;
    initialForm: SuperValidated<RequestLicenseInput>;
  } = $props();

  type Step = "confirm" | "pending" | "assigned";
  let step = $state<Step>("confirm");
  let licenseKey = $state<string | null>(null);
  let copied = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(initialForm, {
    validators: zodClient(requestLicenseSchema),
    invalidateAll: false,
    onUpdate({ result }) {
      if (result.type !== "success") return;
      const data = result.data as ActionResult | null;
      if (data?.pending) {
        step = "pending";
      } else if (data?.licenseKey) {
        licenseKey = data.licenseKey;
        step = "assigned";
        invalidateAll();
      }
    },
    onUpdated({ form }) {
      if (form.message) toast.error(form.message as string);
    },
  });

  const { form: formData, enhance, submitting } = sf;

  $effect(() => {
    if (product) {
      $formData.productId = product.id;
    }
  });

  $effect(() => {
    if (!open) {
      step = "confirm";
      licenseKey = null;
      copied = false;
      sf.reset();
    }
  });

  async function copyKey() {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function dialogTitle() {
    if (step === "pending") return m.request_pending_title();
    if (step === "assigned") return m.request_assigned_title();
    return m.request_dialog_title();
  }

  function licenseTypeName(type: "single" | "volume") {
    return type === "volume" ? m.request_dialog_type_volume() : m.request_dialog_type_single();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="shadow-xl ring-0 sm:max-w-md">
    <div class="grid gap-6">
      <Dialog.Header>
        <Dialog.Title>{dialogTitle()}</Dialog.Title>
      </Dialog.Header>
      <div class="-mx-6 -mt-2"><Separator /></div>

      {#if product && step === "confirm"}
        <form method="post" action="?/requestLicense" use:enhance novalidate class="grid gap-6">
          <input type="hidden" name="productId" bind:value={$formData.productId} />

          <div>
            <p class="font-semibold">{product.name}</p>
            {#if product.description}
              <p class="text-muted-foreground mt-0.5 text-sm">{product.description}</p>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-y-3 text-sm">
            <span class="text-muted-foreground">{m.request_dialog_license_type()}</span>
            <span class="text-right font-medium">{licenseTypeName(product.licenseType)}</span>
            <span class="text-muted-foreground">{m.request_dialog_available()}</span>
            <span class="text-right font-medium">
              {product.available === -1
                ? m.request_dialog_type_volume()
                : m.request_dialog_available_count({ count: product.available })}
            </span>
          </div>

          <div
            class={`rounded-lg p-4 text-sm ${product.requiresApproval ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"}`}
          >
            {#if product.requiresApproval}
              {m.request_dialog_notice_approval({ product: product.name })}
            {:else}
              {m.request_dialog_notice_direct({ product: product.name })}
            {/if}
          </div>

          <div class="flex gap-3">
            <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
              {m.request_dialog_cancel()}
            </Button>
            <Button type="submit" disabled={$submitting} class="flex-1">
              {$submitting
                ? m.request_dialog_submit_loading()
                : product.requiresApproval
                  ? m.request_dialog_submit_approval()
                  : m.request_dialog_submit_direct()}
            </Button>
          </div>
        </form>
      {:else if step === "pending" && product}
        <div class="grid gap-4">
          <div class="flex justify-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Clock class="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold">{m.request_pending_submitted()}</p>
            <p class="text-muted-foreground mt-1 text-sm">
              {m.request_pending_description({ product: product.name })}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-y-3 text-sm">
          <span class="text-muted-foreground">{m.request_pending_product()}</span>
          <span class="text-right font-semibold">{product.name}</span>
          <span class="text-muted-foreground">{m.request_pending_status_label()}</span>
          <span class="flex items-center justify-end gap-1 font-medium text-amber-600">
            <Clock class="h-3.5 w-3.5" />
            {m.request_pending_status()}
          </span>
        </div>

        <Button onclick={() => (open = false)}>{m.request_pending_close()}</Button>
      {:else if step === "assigned"}
        <div class="grid gap-4">
          <div class="flex justify-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 class="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold">{m.request_assigned_success()}</p>
            {#if product}
              <p class="text-muted-foreground mt-1 text-sm">
                {m.request_assigned_subtitle({ product: product.name })}
              </p>
            {/if}
          </div>
        </div>

        <div class="grid gap-1.5">
          <p class="text-sm font-medium">{m.request_assigned_key_label()}</p>
          <div class="bg-muted flex items-center gap-2 rounded-lg border p-3">
            <p class="min-w-0 flex-1 truncate font-mono text-sm">{licenseKey}</p>
            <Button type="button" variant="ghost" size="icon" class="size-7 shrink-0" onclick={copyKey}>
              {#if copied}
                <Check class="size-3.5 text-green-600" />
              {:else}
                <Copy class="size-3.5" />
              {/if}
            </Button>
          </div>
          <p class="text-muted-foreground text-xs">{m.request_assigned_save_hint()}</p>
        </div>

        <Button onclick={() => (open = false)}>{m.request_assigned_go_back()}</Button>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
