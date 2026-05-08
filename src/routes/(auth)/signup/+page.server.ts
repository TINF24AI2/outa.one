import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';

import { m } from '$lib/paraglide/messages.js';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { consumeInvite, getValidInvite } from '$lib/server/invites';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, '/dashboard');
	}

	const token = event.url.searchParams.get('token');
	if (!token) {
		return { error: 'no_invite' as const };
	}

	const invite = await getValidInvite(token);
	if (!invite) {
		return { error: 'invalid_invite' as const };
	}

	return { token: invite.token, email: invite.email };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get('token')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (password !== confirmPassword) {
			return fail(400, { message: m.auth_signup_error_password_mismatch() });
		}
		if (password.length < 8) {
			return fail(400, { message: m.auth_password_min_length() });
		}

		const invite = await getValidInvite(token);
		if (!invite) {
			return fail(400, { message: m.auth_signup_error_invite_invalid() });
		}

		try {
			await auth.api.signUpEmail({ body: { email: invite.email, password, name } });

			if (invite.role === 'admin') {
				await db.update(user).set({ role: 'admin' }).where(eq(user.email, invite.email));
			}

			await consumeInvite(token);
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: m.auth_signup_error_failed() });
			}
			return fail(500, { message: m.auth_error_unexpected() });
		}

		redirect(302, '/signup/success');
	},
};
