<script lang="ts">
import { enhance } from '$app/forms';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Select from '$lib/components/ui/select/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { Mail } from '@lucide/svelte';
import { Description } from '../ui/alert';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];

let value = $state('');

const triggerContent = $derived(roles.find((f) => f.value === value)?.label ?? 'Select a role');

let email = 'john.doe@company.com';
</script>

<Dialog.Root>
	<form>
		<Dialog.Trigger
			type="button"
			class={buttonVariants({ variant: "outline" })}
		>
			Edit User
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Edit User</Dialog.Title>
				<Dialog.Description>
					Editing {email}
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4">
				<div class="grid gap-3">
					<Label for="roles">Role</Label>
					<Select.Root type="single" name="roles" bind:value>
						<Select.Trigger class="w-full">
							{triggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Roles</Select.Label>
								{#each roles as role (role.value)}
									<Select.Item
										value={role.value}
										label={role.label}
									>
										{role.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
					<Dialog.Description class="text-xs"
						>Admins have full access to manage produkts, licenses
						and users</Dialog.Description
					>
				</div>
			</div>
			<Dialog.Footer>
				<Dialog.Close
					type="button"
					class={buttonVariants({ variant: "outline" })}
				>
					Cancel
				</Dialog.Close>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</form>
</Dialog.Root>
