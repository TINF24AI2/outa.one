import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
  if (event.locals.user) {
    return redirect(302, '/demo/better-auth');
  }
  return {};
};

export const actions: Actions = {
  signInEmail: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get('email')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: '/auth/verification-success',
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: error.message || 'Signin failed' });
      }
      return fail(500, { message: 'Unexpected error' });
    }

    return redirect(302, '/demo/better-auth');
  },
  signUpEmail: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get('email')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';
    const name = formData.get('name')?.toString() ?? '';

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          callbackURL: '/auth/verification-success',
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: error.message || 'Registration failed' });
      }
      return fail(500, { message: 'Unexpected error' });
    }

    return redirect(302, '/demo/better-auth');
  },
};
