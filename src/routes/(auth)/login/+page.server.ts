import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { inArray } from "drizzle-orm";

import { DEMO_EMAILS } from "$lib/demo-users";
import { m } from "$lib/paraglide/messages.js";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    redirect(302, "/dashboard");
  }

  const existing = await db.select({ id: user.id }).from(user).where(inArray(user.email, DEMO_EMAILS));
  return { hasDemoUsers: existing };
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    try {
      await auth.api.signInEmail({ body: { email, password } });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, {
          fieldErrors: {
            email: m.auth_login_error_invalid_credentials(),
            password: m.auth_login_error_invalid_credentials(),
          },
        });
      }
      return fail(500, { message: m.auth_error_unexpected() });
    }

    redirect(302, "/dashboard");
  },
};
