<script lang="ts">
  import { Trash2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { Infer } from "zod";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages";
  import { deleteLicenseSchema } from "$lib/schemas/licenses";

  type Props = {
    licenseId: string;
    productName: string;
    form: SuperValidated<Infer<typeof deleteLicenseSchema>>;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { licenseId, productName, form }: Props = $props();
  let open = $state(false);

  // svelte-ignore state_referenced_locally
  const sf = superForm(form, {
    validators: zodClient(deleteLicenseSchema),
    onResult({ result }) {
      if (result.type === "success") {
        open = false;
        toast.success(m.licenses_delete_success());
      }
    },
    onUpdated({ form }) {
      if (form.message) {
        toast.error(form.message as string);
      }
    },
  });

  const { form: formData, enhance, submitting, message } = sf;
</script>

<AppDialog
  bind:open
  title={m.licenses_delete_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.licenses_action_delete()}
>
  {#snippet description()}
    {m.licenses_delete_dialog_description({ product: productName })}
  {/snippet}

  {#snippet trigger()}
    <Trash2 class="text-destructive h-4 w-4" />
  {/snippet}

  <form method="post" action="?/deleteLicense" use:enhance class="grid gap-6">
    <input type="hidden" name="licenseId" bind:value={$formData.licenseId} />

    {#if $message}
      <p class="text-destructive text-sm">{$message}</p>
    {/if}

    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.licenses_popup_add_cancel()}
      </Button>
      <Button type="submit" variant="destructive" disabled={$submitting} class="flex-1">
        {m.licenses_delete_dialog_title()}
      </Button>
    </div>
  </form>
</AppDialog>
