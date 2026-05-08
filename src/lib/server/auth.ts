import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { db } from '$lib/server/db';
import { resetPasswordEmail } from '$lib/server/email-templates';
import { sendEmail } from '$lib/server/mail';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: 'Reset your password – outa.one',
				html: resetPasswordEmail(url),
			});
		},
	},
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent), // make sure this is the last plugin in the array
	],
});
