import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { inArray } from "drizzle-orm";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { DEMO_EMAILS } from "$lib/demo-users";
import { m } from "$lib/paraglide/messages.js";
import { loginSchema } from "$lib/schemas/auth";
import { auth } from "$lib/server/auth";
import { redirectAuthenticated } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  redirectAuthenticated(event);

  const existing = await db.select({ id: user.id }).from(user).where(inArray(user.email, DEMO_EMAILS));

  return {
    form: await superValidate(zod(loginSchema)),
    hasDemoUsers: existing.length > 0,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, zod(loginSchema));
    if (!form.valid) return fail(400, { form });

    let user;
    try {
      const res = await auth.api.signInEmail({ body: { email: form.data.email, password: form.data.password } });
      user = res.user;
    } catch (error) {
      if (error instanceof APIError) {
        setError(form, "email", m.auth_login_error_invalid_credentials());
        return setError(form, "password", m.auth_login_error_invalid_credentials());
      }

      return message(form, m.auth_error_unexpected(), { status: 500 });
    }

    if (user.role === "admin") {
      redirect(302, "/admin/dashboard");
    }
    redirect(302, "/dashboard");
  },
};
