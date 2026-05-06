import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { m } from '$lib/paraglide/messages.js';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    redirect(302, '/dashboard');
  }
  const token = event.url.searchParams.get('token');
  if (!token) {
    redirect(302, '/forgot-password');
  }
  return { token };
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const token = formData.get('token')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';
    const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

    if (password.length < 8) {
      return fail(400, { token, fieldErrors: { password: m.auth_password_min_length() } });
    }
    if (password !== confirmPassword) {
      return fail(400, { token, fieldErrors: { confirmPassword: m.auth_reset_error_password_mismatch() } });
    }

    try {
      await auth.api.resetPassword({ body: { token, newPassword: password } });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { token, message: m.auth_reset_error_token_invalid() });
      }
      return fail(500, { token, message: m.auth_error_unexpected() });
    }

    return { success: true };
  },
};
