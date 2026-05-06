import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
  if (!event.locals.user) {
    redirect(302, '/login');
  }
  return { user: event.locals.user };
};
