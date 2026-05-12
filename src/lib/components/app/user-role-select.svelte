<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { m } from "$lib/paraglide/messages";
  import type { ManagedRole } from "$lib/user-management";

  type Props = {
    id?: string;
    name?: string;
    label: string;
    hint?: string;
    error?: string;
    value?: ManagedRole;
  };

  let { id, name = "role", label, hint, error, value = $bindable<ManagedRole>("user") }: Props = $props();

  const roleOptions = [
    { value: "admin" as const, label: m.role_admin() },
    { value: "user" as const, label: m.role_employee() },
  ];
</script>

<div class="grid gap-3">
  <Label for={id}>{label}</Label>
  <Select.Root type="single" {name} bind:value>
    <Select.Trigger {id} class="w-full">
      {roleOptions.find((role) => role.value === value)?.label ?? m.users_role_placeholder()}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>{m.users_roles_group_label()}</Select.Label>
        {#each roleOptions as role (role.value)}
          <Select.Item value={role.value} label={role.label}>
            {role.label}
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>

  {#if error}
    <p class="text-destructive text-xs">{error}</p>
  {:else if hint}
    <p class="text-muted-foreground text-xs">{hint}</p>
  {/if}
</div>
