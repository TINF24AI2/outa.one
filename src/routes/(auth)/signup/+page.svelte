<script lang="ts">
	import { CircleX, Eye, EyeOff, Link2Off, UserPlus } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { m } from '$lib/paraglide/messages.js';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let name = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let fieldErrors = $state<{
		name?: string;
		password?: string;
		confirmPassword?: string;
	}>({});

	const isError = $derived('error' in data);

	function validate() {
		const errors: typeof fieldErrors = {};
		if (!name.trim()) {
			errors.name = m.auth_signup_error_name_required();
		}
		if (!password) {
			errors.password = m.auth_signup_error_password_required();
		} else if (password.length < 8) {
			errors.password = m.auth_password_min_length();
		}
		if (!confirmPassword) {
			errors.confirmPassword = m.auth_signup_error_confirm_required();
		} else if (password !== confirmPassword) {
			errors.confirmPassword = m.auth_signup_error_password_mismatch();
		}
		return errors;
	}
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
	{#if isError}
		<!-- Invalid / missing invite -->
		<Card class="w-full max-w-sm">
			<CardHeader class="items-center justify-items-center text-center">
				<div class="bg-destructive/10 mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
					{#if data.error === 'no_invite'}
						<Link2Off class="text-destructive h-7 w-7" />
					{:else}
						<CircleX class="text-destructive h-7 w-7" />
					{/if}
				</div>
				<CardTitle class="text-xl">
					{data.error === 'no_invite' ? m.auth_signup_invite_required_title() : m.auth_signup_invite_expired_title()}
				</CardTitle>
				<CardDescription>
					{#if data.error === 'no_invite'}
						{m.auth_signup_invite_required_description()}
					{:else}
						{m.auth_signup_invite_expired_description()}
					{/if}
				</CardDescription>
			</CardHeader>
			<CardContent class="flex justify-center">
				<Button href="/login" variant="outline" class="w-full">
					{m.auth_signup_back_to_login()}
				</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Valid invite — sign-up form -->
		<Card class="w-full max-w-sm">
			<CardHeader class="items-center justify-items-center text-center">
				<div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
					<UserPlus class="h-7 w-7 text-white" />
				</div>
				<CardTitle class="text-xl">{m.auth_signup_title()}</CardTitle>
				<CardDescription>
					{m.auth_signup_description()}
					<br />
					<span class="text-foreground font-medium">{data.email}</span>
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					method="post"
					novalidate
					use:enhance={({ cancel }) => {
						const errors = validate();
						if (Object.keys(errors).length > 0) {
							fieldErrors = errors;
							cancel();
							return;
						}
						fieldErrors = {};
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
					class="flex flex-col gap-4"
				>
					<input type="hidden" name="token" value={data.token} />

					<div class="flex flex-col gap-2">
						<Label for="name">{m.auth_signup_name_label()}</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder={m.auth_signup_name_placeholder()}
							autocomplete="name"
							bind:value={name}
							aria-invalid={!!fieldErrors.name}
						/>
						{#if fieldErrors.name}
							<p class="text-destructive text-xs">{fieldErrors.name}</p>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<Label for="password">{m.auth_signup_password_label()}</Label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								autocomplete="new-password"
								bind:value={password}
								aria-invalid={!!fieldErrors.password}
								class="pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
								aria-label={showPassword ? m.auth_login_hide_password() : m.auth_login_show_password()}
							>
								{#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
							</button>
						</div>
						{#if fieldErrors.password}
							<p class="text-destructive text-xs">{fieldErrors.password}</p>
						{:else}
							<p class="text-muted-foreground text-xs">
								{m.auth_password_min_length()}
							</p>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<Label for="confirmPassword">{m.auth_signup_confirm_label()}</Label>
						<div class="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirm ? 'text' : 'password'}
								placeholder="••••••••"
								autocomplete="new-password"
								bind:value={confirmPassword}
								aria-invalid={!!fieldErrors.confirmPassword}
								class="pr-10"
							/>
							<button
								type="button"
								onclick={() => (showConfirm = !showConfirm)}
								class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
								aria-label={showConfirm ? m.auth_login_hide_password() : m.auth_login_show_password()}
							>
								{#if showConfirm}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
							</button>
						</div>
						{#if fieldErrors.confirmPassword}
							<p class="text-destructive text-xs">
								{fieldErrors.confirmPassword}
							</p>
						{/if}
					</div>

					{#if form?.message}
						<Alert variant="destructive">
							<AlertDescription>{form.message}</AlertDescription>
						</Alert>
					{/if}

					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? m.auth_signup_submit_loading() : m.auth_signup_submit()}
					</Button>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>
