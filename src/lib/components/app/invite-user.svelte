<script lang="ts">
import { enhance } from '$app/forms';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Select from '$lib/components/ui/select/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { Mail, UserPlus } from '@lucide/svelte';
  import { m } from '$lib/paraglide/messages';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];

let value = $state('');

const triggerContent = $derived(roles.find((f) => f.value === value)?.label ?? m.users_role_placeholder());
</script>

<Dialog.Root>
	<form>
		<Dialog.Trigger
			type="button"
			class={buttonVariants({ variant: "default" })}
		>
			<UserPlus />
			{m.users_invite_button()}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{m.users_invite_dialog_title()}</Dialog.Title>
				<Dialog.Description>
					{m.users_invite_dialog_description()}
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4">
				<div class="grid gap-3">
					<Label for="email">{m.users_invite_email_label()}</Label>
					<Input
						id="email"
						name="email"
						placeholder={m.users_invite_email_placeholder()}
					/>
				</div>
				<div class="grid gap-3">
					<Label for="roles">{m.users_role_label()}</Label>
					<Select.Root type="single" name="roles" bind:value>
						<Select.Trigger class="w-full">
							{triggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>{m.users_roles_group_label()}</Select.Label>
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
						>{m.users_role_admin_hint()}</Dialog.Description
					>
				</div>
			</div>
			<Dialog.Footer>
				<Dialog.Close
					type="button"
					class={buttonVariants({ variant: "outline" })}
				>
					{m.users_dialog_cancel()}
				</Dialog.Close>
				<Button type="submit">
					<Mail></Mail>
					{m.users_invite_submit()}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</form>
</Dialog.Root>
