import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { inArray } from "drizzle-orm";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { DEMO_EMAILS } from "$lib/demo-users";
import { m } from "$lib/paraglide/messages.js";
import { loginSchema } from "$lib/schemas/auth";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    redirect(302, "/dashboard");
  }

  const existing = await db.select({ id: user.id }).from(user).where(inArray(user.email, DEMO_EMAILS));
  return {
    form: await superValidate(zod(loginSchema)),
    hasDemoUsers: existing,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, zod(loginSchema));
    if (!form.valid) return fail(400, { form });

    try {
      await auth.api.signInEmail({ body: { email: form.data.email, password: form.data.password } });
    } catch (error) {
      if (error instanceof APIError) {
        setError(form, "email", m.auth_login_error_invalid_credentials());
        return setError(form, "password", m.auth_login_error_invalid_credentials());
      }
      return message(form, m.auth_error_unexpected(), { status: 500 });
    }

    redirect(302, "/dashboard");
  },
};
