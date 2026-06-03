<script lang="ts">
  import { CircleCheck, CircleX } from "@lucide/svelte";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zod4 as zod } from "sveltekit-superforms/adapters";

  import { m } from "$lib/paraglide/messages";
  import { approveRequestSchema, rejectRequestSchema } from "$lib/schemas/admin-requests";

  import AppDialog from "./app-dialog.svelte";

  interface Props {
    requestId: string;
    userName: string;
    productName: string;
    availableUsage: number;
    approveFormData: SuperValidated<{ requestId: string }>;
    rejectFormData: SuperValidated<{ requestId: string; reason?: string }>;
  }

  let { requestId, userName, productName, availableUsage, approveFormData, rejectFormData }: Props = $props();

  const {
    enhance: approveEnhance,
    submitting: approveSubmitting,
    message: approveMessage,
  } = superForm(approveFormData, { validators: zod(approveRequestSchema), id: approveFormData.id });

  const {
    enhance: rejectEnhance,
    submitting: rejectSubmitting,
    message: rejectMessage,
    form: rejectFormStore,
  } = superForm(rejectFormData, { validators: zod(rejectRequestSchema), id: rejectFormData.id });
</script>

{#if $approveMessage}
  <p class="text-xs text-red-500">{$approveMessage}</p>
{/if}
{#if $rejectMessage}
  <p class="text-xs text-red-500">{$rejectMessage}</p>
{/if}

<div class="flex items-center gap-2">
  <!-- Approve dialog -->
  <AppDialog
    title={m.requests_approve_confirm()}
    triggerDisabled={availableUsage === 0}
    triggerClass="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-40"
  >
    {#snippet trigger()}
      <CircleCheck class="h-4 w-4" />
      <span>{m.requests_approve()}</span>
    {/snippet}
    {#snippet description()}
      {m.requests_approve_confirm_desc({ productName, userName })}
    {/snippet}
    <form method="POST" action="?/approve" use:approveEnhance class="flex justify-end pt-2">
      <input type="hidden" name="requestId" value={requestId} />
      <button
        type="submit"
        disabled={$approveSubmitting}
        class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CircleCheck class="h-4 w-4" />
        {m.requests_approve_confirm_btn()}
      </button>
    </form>
  </AppDialog>

  <!-- Reject dialog -->
  <AppDialog
    title={m.requests_deny_confirm()}
    triggerClass="inline-flex min-w-26 items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-500 transition"
  >
    {#snippet trigger()}
      <CircleX class="h-4 w-4" />
      <span>{m.requests_deny()}</span>
    {/snippet}
    {#snippet description()}
      {m.requests_deny_confirm_desc()}
    {/snippet}
    <form method="POST" action="?/reject" use:rejectEnhance class="flex flex-col gap-4 pt-2">
      <input type="hidden" name="requestId" value={requestId} />
      <div class="flex flex-col gap-1.5">
        <label for="reason-{requestId}" class="text-sm font-medium text-gray-700">
          {m.requests_deny_reason_label()}
        </label>
        <textarea
          id="reason-{requestId}"
          name="reason"
          rows="3"
          bind:value={$rejectFormStore.reason}
          placeholder={m.requests_deny_reason_placeholder()}
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        ></textarea>
      </div>
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={$rejectSubmitting}
          class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CircleX class="h-4 w-4" />
          {m.requests_deny_confirm_btn()}
        </button>
      </div>
    </form>
  </AppDialog>
</div>
