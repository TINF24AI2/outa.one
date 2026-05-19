<script lang="ts">
  import { UserPen, X } from "@lucide/svelte";
  import { deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages";

  type User = { value: string; label: string };

  type Props = {
    licenseId: string;
    productName: string;
    usageVolume: number;
    userOptions: User[];
    assignedUsers: User[];
  };

  let { licenseId, productName, usageVolume, userOptions, assignedUsers: initialAssignedUsers }: Props = $props();

  let open = $state(false);
  let selectedUser = $state("");
  let assignedUsers = $state<User[]>([...initialAssignedUsers]);
  let saving = $state(false);
  let errorMessage = $state("");

  const isUnlimited = $derived(usageVolume === 0);
  const atCapacity = $derived(!isUnlimited && assignedUsers.length >= usageVolume);

  const availableOptions = $derived(userOptions.filter((u) => !assignedUsers.some((a) => a.value === u.value)));

  function addUser() {
    const user = availableOptions.find((u) => u.value === selectedUser);
    if (!user) return;
    assignedUsers = [...assignedUsers, user];
    selectedUser = "";
  }

  function removeUser(value: string) {
    assignedUsers = assignedUsers.filter((u) => u.value !== value);
  }

  $effect(() => {
    if (!open) {
      assignedUsers = [...initialAssignedUsers];
      selectedUser = "";
      errorMessage = "";
    }
  });

  async function save() {
    saving = true;
    errorMessage = "";

    const toAdd = assignedUsers.filter((u) => !initialAssignedUsers.some((a) => a.value === u.value));
    const toRemove = initialAssignedUsers.filter((u) => !assignedUsers.some((a) => a.value === u.value));

    try {
      for (const u of toRemove) {
        const fd = new FormData();
        fd.set("licenseId", licenseId);
        fd.set("userId", u.value);
        await fetch("?/unassignUser", { method: "POST", body: fd });
      }

      for (const u of toAdd) {
        const fd = new FormData();
        fd.set("licenseId", licenseId);
        fd.set("userId", u.value);
        const res = await fetch("?/assignUser", { method: "POST", body: fd });
        const result = deserialize(await res.text());
        if (result.type === "failure" || result.type === "error") {
          const msg =
            result.type === "failure"
              ? ((result.data as Record<string, unknown>)?.form as Record<string, unknown>)?.message
              : result.error;
          errorMessage = typeof msg === "string" ? msg : "Failed to assign user";
          return;
        }
      }

      open = false;
      if (toAdd.length > 0 || toRemove.length > 0) toast.success("Users updated successfully");
      await invalidateAll();
    } catch (e) {
      console.error("Failed to save user assignments:", e);
      errorMessage = "An unexpected error occurred. Please try again.";
    } finally {
      saving = false;
    }
  }
</script>

<AppDialog
  bind:open
  title={m.licenses_assign_dialog_title()}
  triggerClass={buttonVariants({ variant: "ghost", size: "icon-sm" })}
  triggerTitle={m.licenses_action_assign_user()}
>
  {#snippet description()}
    {m.licenses_assign_dialog_description({ product: productName })}
  {/snippet}

  {#snippet trigger()}
    <UserPen class="h-4 w-4 text-gray-500" />
  {/snippet}

  <div class="grid gap-5">
    <!-- Slot indicator -->
    <div class="grid gap-1.5 rounded-md bg-slate-50 px-3 py-2.5">
      {#if isUnlimited}
        <span class="text-sm text-gray-500">{m.licenses_assign_dialog_slots_unlimited()}</span>
      {:else}
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">
            {m.licenses_assign_dialog_slots({ used: assignedUsers.length, total: usageVolume })}
          </span>
          <span class="text-xs font-medium {atCapacity ? 'text-amber-600' : 'text-gray-400'}">
            {Math.round((assignedUsers.length / usageVolume) * 100)}%
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-full rounded-full transition-all {atCapacity ? 'bg-amber-500' : 'bg-indigo-500'}"
            style="width: {(assignedUsers.length / usageVolume) * 100}%"
          ></div>
        </div>
      {/if}
    </div>

    <!-- Assigned users list -->
    {#if assignedUsers.length > 0}
      <ul class="grid gap-1.5">
        {#each assignedUsers as user (user.value)}
          <li class="flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm">
            <span class="font-medium text-gray-800">{user.label}</span>
            <button
              type="button"
              onclick={() => removeUser(user.value)}
              class="text-gray-400 transition-colors hover:text-gray-700"
              aria-label="Remove {user.label}"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-center text-sm text-gray-400">{m.licenses_assign_dialog_no_users()}</p>
    {/if}

    <!-- Add user row -->
    <div class="grid gap-1.5">
      {#if atCapacity}
        <p class="text-sm text-amber-600">{m.licenses_assign_dialog_at_capacity()}</p>
      {:else}
        <div class="flex gap-2">
          <div class="flex-1">
            <Combobox
              id="assign-user-select"
              bind:value={selectedUser}
              options={availableOptions}
              placeholder={m.licenses_assign_dialog_add_user_label()}
            />
          </div>
          <Button type="button" variant="secondary" disabled={!selectedUser} onclick={addUser}>
            {m.licenses_assign_dialog_add_button()}
          </Button>
        </div>
      {/if}
    </div>

    {#if errorMessage}
      <p class="text-destructive text-sm">{errorMessage}</p>
    {/if}

    <!-- Actions -->
    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.licenses_assign_dialog_cancel()}
      </Button>
      <Button type="button" class="flex-1" disabled={saving} onclick={save}>
        {#if saving}
          Saving…
        {:else}
          {m.licenses_assign_dialog_save()}
        {/if}
      </Button>
    </div>
  </div>
</AppDialog>
