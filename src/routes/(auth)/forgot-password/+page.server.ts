import { fail, redirect } from '@sveltejs/kit';

import { m } from '$lib/paraglide/messages.js';
import { auth } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { fieldError: m.auth_forgot_error_email_invalid() });
		}

		try {
			await auth.api.requestPasswordReset({
				body: { email, redirectTo: `${event.url.origin}/reset-password` },
			});
		} catch {
			// Always show success to prevent email enumeration
		}

		return { success: true, email };
	},
};
