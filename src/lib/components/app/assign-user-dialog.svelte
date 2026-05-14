<script lang="ts">
  import { UserPen, X } from "@lucide/svelte";

  import AppDialog from "$lib/components/app/app-dialog.svelte";
  import Combobox from "$lib/components/product-combobox.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages";

  type User = { value: string; label: string };

  type Props = {
    productName: string;
    usageVolume: number;
    userOptions: User[];
  };

  let { productName, usageVolume, userOptions }: Props = $props();

  let open = $state(false);
  let selectedUser = $state("");
  let assignedUsers = $state<User[]>([]);

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
      assignedUsers = [];
      selectedUser = "";
    }
  });
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

    <!-- Actions -->
    <div class="flex gap-3">
      <Button type="button" variant="secondary" class="flex-1" onclick={() => (open = false)}>
        {m.licenses_assign_dialog_cancel()}
      </Button>
      <Button type="button" class="flex-1" disabled={assignedUsers.length === 0}>
        {m.licenses_assign_dialog_save()}
      </Button>
    </div>
  </div>
</AppDialog>
