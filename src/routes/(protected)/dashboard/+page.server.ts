import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { m } from '$lib/paraglide/messages.js';
import { auth } from '$lib/server/auth';
import { createInvite } from '$lib/server/invites';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
  // biome-ignore lint/style/noNonNullAssertion: user is guaranteed by layout guard
  return { user: event.locals.user! };
};

export const actions: Actions = {
  signOut: async (event) => {
    await auth.api.signOut({ headers: event.request.headers });
    redirect(302, '/login');
  },

  generateInvite: async (event) => {
    if (event.locals.user?.role !== 'admin') {
      return fail(403, { error: m.dashboard_invite_error_forbidden() });
    }

    const formData = await event.request.formData();
    const email = formData.get('email')?.toString().trim() ?? '';
    const grantAdmin = formData.get('grantAdmin') === 'on';

    if (!email?.includes('@')) {
      return fail(400, { error: m.dashboard_invite_error_email_invalid() });
    }

    const role = grantAdmin ? 'admin' : 'user';
    try {
      const invite = await createInvite(email, role);
      const inviteUrl = `${env.ORIGIN}/signup?token=${invite.token}`;
      return { inviteUrl, email, role };
    } catch (_error) {
      return fail(400, { error: m.dashboard_invite_error_failed() });
    }
  },
};
