<script lang="ts">
	import { CircleCheckBig, Eye, EyeOff } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import logo from '$lib/assets/logo.svg';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { m } from '$lib/paraglide/messages.js';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loading = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let fieldErrors = $state<{ password?: string; confirmPassword?: string }>({});

	const serverFieldErrors = $derived(
		(form?.fieldErrors ?? {}) as {
			password?: string;
			confirmPassword?: string;
		},
	);

	function validate() {
		const errors: typeof fieldErrors = {};
		if (!password) {
			errors.password = m.auth_reset_error_password_required();
		} else if (password.length < 8) {
			errors.password = m.auth_password_min_length();
		}
		if (!confirmPassword) {
			errors.confirmPassword = m.auth_reset_error_confirm_required();
		} else if (password !== confirmPassword) {
			errors.confirmPassword = m.auth_reset_error_password_mismatch();
		}
		return errors;
	}

	$effect(() => {
		if (form?.success) {
			const timer = setTimeout(() => goto(resolve('/login')), 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
	{#if form?.success}
		<Card class="w-full max-w-sm">
			<CardHeader class="items-center justify-items-center text-center">
				<div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
					<CircleCheckBig class="h-7 w-7 text-green-600" />
				</div>
				<CardTitle class="text-xl">{m.auth_reset_success_title()}</CardTitle>
				<CardDescription>
					{m.auth_reset_success_description()}
				</CardDescription>
			</CardHeader>
			<CardContent class="text-muted-foreground text-center text-sm">
				{m.auth_reset_redirecting()}
			</CardContent>
		</Card>
	{:else}
		<Card class="w-full max-w-sm">
			<CardHeader class="items-center justify-items-center text-center">
				<div class="bg-primary mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
					<img src={logo} alt={m.auth_reset_logo_alt()} class="h-8 w-8 object-contain brightness-0 invert" />
				</div>
				<CardTitle class="text-xl">{m.auth_reset_title()}</CardTitle>
				<CardDescription>{m.auth_reset_description()}</CardDescription>
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
						<Label for="password">{m.auth_reset_password_label()}</Label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								autocomplete="new-password"
								bind:value={password}
								aria-invalid={!!(fieldErrors.password || serverFieldErrors.password)}
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
						{#if fieldErrors.password || serverFieldErrors.password}
							<p class="text-destructive text-xs">
								{fieldErrors.password ?? serverFieldErrors.password}
							</p>
						{:else}
							<p class="text-muted-foreground text-xs">
								{m.auth_password_min_length()}
							</p>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<Label for="confirmPassword">{m.auth_reset_confirm_label()}</Label>
						<div class="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirm ? 'text' : 'password'}
								placeholder="••••••••"
								autocomplete="new-password"
								bind:value={confirmPassword}
								aria-invalid={!!(fieldErrors.confirmPassword || serverFieldErrors.confirmPassword)}
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
						{#if fieldErrors.confirmPassword || serverFieldErrors.confirmPassword}
							<p class="text-destructive text-xs">
								{fieldErrors.confirmPassword ?? serverFieldErrors.confirmPassword}
							</p>
						{/if}
					</div>

					{#if form?.message}
						<Alert variant="destructive">
							<AlertDescription>{form.message}</AlertDescription>
						</Alert>
					{/if}

					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? m.auth_reset_submit_loading() : m.auth_reset_submit()}
					</Button>
				</form>

				<div class="mt-4 text-center">
					<Button variant="link" href="/login" class="text-muted-foreground h-auto p-0 text-sm">
						{m.auth_reset_back_to_login()}
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
